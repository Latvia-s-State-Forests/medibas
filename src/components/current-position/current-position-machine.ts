import * as Location from "expo-location";
import { Platform } from "react-native";
import { assign, fromCallback, setup } from "xstate";
import { logger } from "~/logger";
import { Config } from "~/types/config";
import { PositionResult } from "~/types/position-result";

type CurrentPositionEvent =
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
    | { type: "RESET" };

export const currentPositionMachine = setup({
    types: {
        context: {} as { position?: PositionResult | undefined; config: Config },
        events: {} as CurrentPositionEvent,
        input: {} as { config: Config; initialPosition?: PositionResult },
    },
    actions: {
        assignPosition: assign({
            position: ({ context, event }) => {
                if (event.type !== "POSITION_SUCCESS") {
                    return context.position;
                }
                return event.position;
            },
        }),
        resetPosition: assign({
            position: undefined,
        }),
        notifyPosition: () => {
            // handled externally
        },
    },
    delays: {
        TIMER_DURATION: 3 * 60 * 1000, // 3 minutes
    },
    guards: {
        hasPosition: ({ context }) => context.position !== undefined,
    },
    actors: {
        verifyServices: fromCallback(({ sendBack }: { sendBack: (event: CurrentPositionEvent) => void }) => {
            let ignore = false;

            Location.hasServicesEnabledAsync()
                .then((enabled) => {
                    if (ignore) {
                        return;
                    }

                    if (enabled) {
                        sendBack({ type: "SERVICES_ENABLED" });
                    } else {
                        sendBack({ type: "SERVICES_DISABLED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to verify services", error);
                    sendBack({ type: "SERVICES_ERROR" });
                });

            return () => {
                ignore = true;
            };
        }),
        verifyPermissions: fromCallback(({ sendBack }: { sendBack: (event: CurrentPositionEvent) => void }) => {
            let ignore = false;

            Location.getForegroundPermissionsAsync()
                .then(({ status, canAskAgain }) => {
                    if (ignore) {
                        return;
                    }

                    if (status === "granted") {
                        sendBack({ type: "PERMISSIONS_GRANTED" });
                    } else if (status === "undetermined") {
                        sendBack({ type: "PERMISSIONS_PENDING" });
                    } else if (status === "denied") {
                        // On Android 10 and above, the user can choose option "Ask every time", which returns status: "denied" and canAskAgain: false
                        // This issue has been reported here: https://github.com/expo/expo/issues/19047
                        // Despite caAskAgain being false, we still can request permissions, otherwise location fails
                        if (canAskAgain || (Platform.OS === "android" && Platform.Version >= 29)) {
                            sendBack({ type: "PERMISSIONS_PENDING" });
                            return;
                        } else {
                            sendBack({ type: "PERMISSIONS_DENIED" });
                        }
                    } else {
                        sendBack({ type: "PERMISSIONS_DENIED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to verify permissions", error);
                    sendBack({ type: "PERMISSIONS_ERROR" });
                });

            return () => {
                ignore = true;
            };
        }),
        requestPermissions: fromCallback(({ sendBack }: { sendBack: (event: CurrentPositionEvent) => void }) => {
            Location.requestForegroundPermissionsAsync()
                .then(({ status }) => {
                    if (status === "granted") {
                        sendBack({ type: "PERMISSIONS_GRANTED" });
                    } else {
                        sendBack({ type: "PERMISSIONS_DENIED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to request permissions", error);
                    sendBack({ type: "PERMISSIONS_DENIED" });
                });
        }),
        watchPosition: fromCallback(
            ({ sendBack, input }: { sendBack: (event: CurrentPositionEvent) => void; input: { config: Config } }) => {
                const config = input.config;
                let subscription: Location.LocationSubscription | undefined;
                let isInaccuratePositionReceived = false;

                const timeout = setTimeout(
                    () => {
                        if (isInaccuratePositionReceived) {
                            sendBack({ type: "POSITION_FAILURE_ACCURACY" });
                        } else {
                            sendBack({ type: "POSITION_FAILURE_OTHER" });
                        }
                    },
                    Number(config.gpsTimeout) * 1000
                );

                Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.Highest },
                    ({ coords, timestamp, mocked }) => {
                        // Apply validations in production only
                        if (
                            process.env.EXPO_PUBLIC_APP_VARIANT === "production" ||
                            process.env.EXPO_PUBLIC_APP_VARIANT === "beta"
                        ) {
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
                                sendBack({ type: "POSITION_FAILURE_OTHER" });
                                return;
                            }
                        }
                        sendBack({
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
                        sendBack({ type: "POSITION_FAILURE_OTHER" });
                    });

                return () => {
                    subscription?.remove();
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                };
            }
        ),
    },
}).createMachine({
    id: "currentPosition",
    context: ({ input }) => ({ config: input.config, position: input.initialPosition }),
    initial: "loading",
    states: {
        loading: {
            always: [{ target: "success", guard: "hasPosition" }, { target: "verifyingServices" }],
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
            invoke: { src: "watchPosition", input: ({ context }) => ({ config: context.config }) },
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
});
