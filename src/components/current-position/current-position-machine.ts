import * as Location from "expo-location";
import { Platform } from "react-native";
import { assign, createMachine } from "xstate";
import { logger } from "~/logger";
import { Config } from "~/types/config";
import { PositionResult } from "~/types/position-result";

export const currentPositionMachine = createMachine(
    {
        schema: {
            context: {} as { position?: PositionResult | undefined; config: Config },
            events: {} as
                | { type: "SERVICES_ENABLED" }
                | { type: "SERVICES_DISABLED" }
                | { type: "SERVICES_ERROR" }
                | { type: "PERMISSIONS_PENDING" }
                | { type: "PERMISSIONS_GRANTED" }
                | { type: "PERMISSIONS_DENIED" }
                | { type: "PERMISSIONS_ERROR" }
                | { type: "POSITION_SUCCESS"; position: PositionResult }
                | { type: "POSITION_FAILURE_OTHER" }
                | { type: "POSITION_FAILURE_ACCURACY" }
                | { type: "RESET" },
        },
        id: "currentPosition",
        initial: "loading",
        states: {
            loading: {
                always: [{ target: "success", cond: "hasPosition" }, { target: "verifyingServices" }],
            },
            verifyingServices: {
                invoke: { src: "verifyServices" },
                on: {
                    SERVICES_ENABLED: { target: "verifyingPermissions" },
                    SERVICES_DISABLED: { target: "failure.other" },
                },
            },
            verifyingPermissions: {
                invoke: { src: "verifyPermissions" },
                on: {
                    PERMISSIONS_GRANTED: { target: "watchingPosition" },
                    PERMISSIONS_PENDING: { target: "requestingPermissions" },
                    PERMISSIONS_DENIED: { target: "failure.permissions" },
                    PERMISSIONS_ERROR: { target: "failure.permissions" },
                },
            },
            requestingPermissions: {
                invoke: { src: "requestPermissions" },
                on: {
                    PERMISSIONS_GRANTED: { target: "watchingPosition" },
                    PERMISSIONS_DENIED: { target: "failure.permissions" },
                    PERMISSIONS_ERROR: { target: "failure.permissions" },
                },
            },
            watchingPosition: {
                invoke: {
                    src: "watchPosition",
                },
                on: {
                    POSITION_SUCCESS: { target: "success", actions: ["assignPosition", "notifyPosition"] },
                    POSITION_FAILURE_OTHER: { target: "failure.other" },
                    POSITION_FAILURE_ACCURACY: { target: "failure.accuracy" },
                },
            },
            success: {
                on: { RESET: { target: "verifyingServices", actions: ["resetPosition", "notifyPosition"] } },
                //resets position after timer
                after: {
                    TIMER_DURATION: { target: "verifyingServices", actions: ["resetPosition", "notifyPosition"] },
                },
            },
            failure: {
                initial: "permissions",
                states: {
                    permissions: {},
                    other: {},
                    accuracy: {},
                },
                on: { RESET: { target: "verifyingServices" } },
            },
        },
        predictableActionArguments: true,
        preserveActionOrder: true,
    },
    {
        actions: {
            assignPosition: assign({
                position: (context, event) => {
                    if (event.type !== "POSITION_SUCCESS") {
                        return context.position;
                    }
                    return event.position;
                },
            }),
            resetPosition: assign({
                position: undefined,
            }),
        },
        delays: {
            TIMER_DURATION: 3 * 60 * 1000, // 3 minutes
        },
        guards: {
            hasPosition: (context) => context.position !== undefined,
        },
        services: {
            verifyServices: () => (send) => {
                let ignore = false;

                Location.hasServicesEnabledAsync()
                    .then((enabled) => {
                        if (ignore) {
                            return;
                        }

                        if (enabled) {
                            send("SERVICES_ENABLED");
                        } else {
                            send("SERVICES_DISABLED");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to verify services", error);
                        send("SERVICES_ERROR");
                    });

                return () => {
                    ignore = true;
                };
            },
            verifyPermissions: () => (send) => {
                let ignore = false;

                Location.getForegroundPermissionsAsync()
                    .then(({ status, canAskAgain }) => {
                        if (ignore) {
                            return;
                        }

                        if (status === "granted") {
                            send("PERMISSIONS_GRANTED");
                        } else if (status === "undetermined") {
                            send("PERMISSIONS_PENDING");
                        } else if (status === "denied") {
                            // On Android 10 and above, the user can choose option "Ask every time", which returns status: "denied" and canAskAgain: false
                            // This issue has been reported here: https://github.com/expo/expo/issues/19047
                            // Despite caAskAgain being false, we still can request permissions, otherwise location fails
                            if (canAskAgain || (Platform.OS === "android" && Platform.Version >= 29)) {
                                send("PERMISSIONS_PENDING");
                                return;
                            } else {
                                send("PERMISSIONS_DENIED");
                            }
                        } else {
                            send("PERMISSIONS_DENIED");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to verify permissions", error);
                        send("PERMISSIONS_ERROR");
                    });

                return () => {
                    ignore = true;
                };
            },
            requestPermissions: () => (send) => {
                Location.requestForegroundPermissionsAsync()
                    .then(({ status }) => {
                        if (status === "granted") {
                            send("PERMISSIONS_GRANTED");
                        } else {
                            send("PERMISSIONS_DENIED");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to request permissions", error);
                        send("PERMISSIONS_DENIED");
                    });
            },
            watchPosition: (context) => (send) => {
                const { config } = context;
                let subscription: Location.LocationSubscription | undefined;
                let isInaccuratePositionReceived = false;

                const timeout = setTimeout(
                    () => {
                        if (isInaccuratePositionReceived) {
                            send("POSITION_FAILURE_ACCURACY");
                        } else {
                            send("POSITION_FAILURE_OTHER");
                        }
                    },
                    Number(config.gpsTimeout) * 1000
                );

                Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.Highest },
                    ({ coords, timestamp, mocked }) => {
                        // Apply validations in production only
                        if (process.env.APP_VARIANT === "production" || process.env.APP_VARIANT === "beta") {
                            // Position must be accurate
                            if (coords.accuracy === null || coords.accuracy > Number(config.gpsMinAccuracy)) {
                                logger.error(
                                    `Invalid position, expected <= ${config.gpsMinAccuracy} m, got ${coords.accuracy} m`
                                );
                                isInaccuratePositionReceived = true;
                                return;
                            }
                            const gpsMaxAgeMs = Number(config.gpsMaxAge) * 1000;
                            const actualAgeMs = Date.now() - timestamp;
                            // Position must be recent
                            if (actualAgeMs > gpsMaxAgeMs) {
                                logger.error(
                                    `Invalid position, expected age <= ${gpsMaxAgeMs} ms, got ${actualAgeMs} ms`
                                );
                                return;
                            }

                            // Position must not be mocked
                            if (mocked) {
                                logger.error("Invalid position, expected real position, got mocked position");
                                send("POSITION_FAILURE_OTHER");
                                return;
                            }
                        }
                        send({
                            type: "POSITION_SUCCESS",
                            position: {
                                latitude: coords.latitude,
                                longitude: coords.longitude,
                                accuracy: coords.accuracy!,
                            },
                        });
                    }
                )
                    .then((locationSubscription) => {
                        subscription = locationSubscription;
                    })
                    .catch((error) => {
                        logger.error("Failed to watch location", error);
                        send("POSITION_FAILURE_OTHER");
                    });

                return () => {
                    subscription?.remove();
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                };
            },
        },
    }
);
