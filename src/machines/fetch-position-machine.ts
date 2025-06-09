import * as Location from "expo-location";
import { Platform } from "react-native";
import { createMachine } from "xstate";
import { logger } from "~/logger";
import { Config } from "~/types/config";
import { PositionResult } from "~/types/position-result";

export const fetchPositionMachine = createMachine(
    {
        schema: {
            context: {} as { config: Config },
            events: {} as
                | { type: "FETCH" }
                | { type: "CANCEL" }
                | { type: "PERMISSIONS_DENIED" }
                | { type: "PERMISSIONS_ERROR" }
                | { type: "PERMISSIONS_GRANTED" }
                | { type: "PERMISSIONS_PENDING" }
                | { type: "POSITION_FAILURE_ACCURACY" }
                | { type: "POSITION_FAILURE_OTHER" }
                | { type: "POSITION_FAILURE_TIMEOUT" }
                | { type: "POSITION_SUCCESS"; position: PositionResult }
                | { type: "RESET" }
                | { type: "SERVICES_DISABLED" }
                | { type: "SERVICES_ENABLED" }
                | { type: "SERVICES_ERROR" },
        },
        id: "fetchPosition",
        initial: "idle",
        states: {
            idle: {
                on: {
                    FETCH: { target: "verifyingServices" },
                },
            },
            verifyingServices: {
                invoke: { src: "verifyServices" },
                on: {
                    SERVICES_ENABLED: { target: "verifyingPermissions" },
                    SERVICES_DISABLED: { target: "failure.other" },
                    SERVICES_ERROR: { target: "failure.other" },
                },
            },
            verifyingPermissions: {
                invoke: { src: "verifyPermissions" },
                on: {
                    PERMISSIONS_GRANTED: { target: "fetchingPosition" },
                    PERMISSIONS_PENDING: { target: "requestingPermissions" },
                    PERMISSIONS_DENIED: { target: "failure.permissions" },
                    PERMISSIONS_ERROR: { target: "failure.permissions" },
                },
            },
            requestingPermissions: {
                invoke: { src: "requestPermissions" },
                on: {
                    PERMISSIONS_GRANTED: { target: "fetchingPosition" },
                    PERMISSIONS_DENIED: { target: "failure.permissions" },
                    PERMISSIONS_ERROR: { target: "failure.permissions" },
                },
            },
            fetchingPosition: {
                invoke: {
                    src: "fetchPosition",
                },
                on: {
                    CANCEL: { target: "idle" },
                    POSITION_SUCCESS: { target: "idle", actions: ["onPositionSuccess"] },
                    POSITION_FAILURE_OTHER: { target: "failure.other", actions: ["onPositionFailure"] },
                    POSITION_FAILURE_ACCURACY: { target: "failure.accuracy", actions: ["onPositionFailure"] },
                    POSITION_FAILURE_TIMEOUT: { target: "failure.timeout", actions: ["onPositionFailure"] },
                },
            },
            failure: {
                initial: "other",
                states: {
                    permissions: {},
                    other: {},
                    accuracy: {},
                    timeout: {},
                },
                on: {
                    RESET: { target: "idle" },
                },
            },
        },
        predictableActionArguments: true,
        preserveActionOrder: true,
    },
    {
        actions: {
            onPositionSuccess: () => {
                // This action can be overridden when creating the machine instance
                // to provide custom success handling
            },
            onPositionFailure: () => {
                // This action can be overridden when creating the machine instance
                // to provide custom failure handling
            },
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
                        if (ignore) {
                            return;
                        }

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
                            // Despite canAskAgain being false, we still can request permissions, otherwise location fails
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
                        if (ignore) {
                            return;
                        }

                        logger.error("Failed to verify permissions", error);
                        send("PERMISSIONS_ERROR");
                    });

                return () => {
                    ignore = true;
                };
            },
            requestPermissions: () => (send) => {
                let ignore = false;

                Location.requestForegroundPermissionsAsync()
                    .then(({ status }) => {
                        if (ignore) {
                            return;
                        }

                        if (status === "granted") {
                            send("PERMISSIONS_GRANTED");
                        } else {
                            send("PERMISSIONS_DENIED");
                        }
                    })
                    .catch((error) => {
                        if (ignore) {
                            return;
                        }

                        logger.error("Failed to request permissions", error);
                        send("PERMISSIONS_DENIED");
                    });

                return () => {
                    ignore = true;
                };
            },
            fetchPosition: (context) => (send) => {
                const { config } = context;
                let ignore = false;
                let subscription: Location.LocationSubscription | undefined;
                let isInaccuratePositionReceived = false;

                const timeout = setTimeout(
                    () => {
                        if (isInaccuratePositionReceived) {
                            send("POSITION_FAILURE_ACCURACY");
                        } else {
                            send("POSITION_FAILURE_TIMEOUT");
                        }
                    },
                    Number(config.gpsTimeout) * 1000
                );

                Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.Highest },
                    ({ coords, timestamp, mocked }) => {
                        if (ignore) {
                            return;
                        }

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
                                accuracy: coords.accuracy ?? undefined,
                            },
                        });
                    }
                )
                    .then((locationSubscription) => {
                        subscription = locationSubscription;
                        if (ignore) {
                            subscription.remove();
                        }
                    })
                    .catch((error) => {
                        if (ignore) {
                            return;
                        }
                        logger.error("Failed to watch location", error);
                        send("POSITION_FAILURE_OTHER");
                    });

                return () => {
                    ignore = true;
                    subscription?.remove();
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                };
            },
        },
    }
);
