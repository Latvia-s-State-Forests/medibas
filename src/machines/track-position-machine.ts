import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Location from "expo-location";
import { AppState, AppStateStatus, Platform } from "react-native";
import { assign, fromCallback, setup } from "xstate";
import { logger } from "~/logger";

type TrackPositionEvent =
    | { type: "APP_BACKGROUNDED" }
    | { type: "APP_FOREGROUNDED" }
    | { type: "MAP_DRAGGED" }
    | { type: "PERMISSIONS_DENIED" }
    | { type: "PERMISSIONS_GRANTED" }
    | { type: "PERMISSIONS_PENDING" }
    | { type: "PERMISSIONS_ERROR" }
    | { type: "LOCATION_CHANGED"; location: GeoJSON.Position; accuracy?: number }
    | { type: "HEADING_CHANGED"; heading: number } // New event type for heading changes
    | { type: "LOCATION_ERROR" }
    | { type: "LOCATION_TIMEOUT" }
    | { type: "RESET" }
    | { type: "SCREEN_BLUR" }
    | { type: "SCREEN_FOCUS" }
    | { type: "SERVICES_DISABLED" }
    | { type: "SERVICES_ENABLED" }
    | { type: "SERVICES_ERROR" }
    | { type: "TOGGLE" };

export const trackPositionMachine = setup({
    types: {
        context: {} as { location?: GeoJSON.Position; accuracy?: number; heading?: number }, // Heading is now part of context
        events: {} as TrackPositionEvent,
    },
    actions: {
        setLocation: assign(({ context, event }) => {
            if (event.type !== "LOCATION_CHANGED") {
                return context;
            }
            return { location: event.location, accuracy: event.accuracy };
        }),
        setHeading: assign(({ context, event }) => {
            if (event.type !== "HEADING_CHANGED") {
                return context;
            }
            return { ...context, heading: event.heading }; // Update heading in context
        }),
        resetPosition: assign(() => ({ location: undefined, accuracy: undefined, heading: undefined })), // Reset heading as well
        activateKeepAwake: () => {
            activateKeepAwakeAsync().catch((error) => {
                logger.error("Failed to activate keep awake", error);
            });
        },
        deactivateKeepAwake: () => {
            deactivateKeepAwake().catch((error) => {
                logger.error("Failed to deactivate keep awake", error);
            });
        },
        setPositionOnMap: () => {
            // handled externally
        },
        removePositionFromMap: () => {
            // handled externally
        },
        restorePositionOnMap: () => {
            // handled externally
        },
    },
    actors: {
        verifyServices: fromCallback(({ sendBack }: { sendBack: (event: TrackPositionEvent) => void }) => {
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
        verifyPermissions: fromCallback(({ sendBack }: { sendBack: (event: TrackPositionEvent) => void }) => {
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
        requestPermissions: fromCallback(({ sendBack }: { sendBack: (event: TrackPositionEvent) => void }) => {
            let ignore = false;

            Location.requestForegroundPermissionsAsync()
                .then(({ status }) => {
                    if (ignore) {
                        return;
                    }

                    if (status === "granted") {
                        sendBack({ type: "PERMISSIONS_GRANTED" });
                    } else {
                        sendBack({ type: "PERMISSIONS_DENIED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to request permissions", error);
                    sendBack({ type: "PERMISSIONS_ERROR" });
                });

            return () => {
                ignore = true;
            };
        }),
        watchPosition: fromCallback(({ sendBack }: { sendBack: (event: TrackPositionEvent) => void }) => {
            let ignore = false;
            let subscription: Location.LocationSubscription | undefined;

            Location.watchPositionAsync(
                {
                    accuracy: Location.LocationAccuracy.High,
                    distanceInterval: 1, // To often calls was making the gps arrow studde
                    timeInterval: 1000, // 1 second
                },
                ({ coords }) => {
                    if (ignore) {
                        subscription?.remove();
                        return;
                    }

                    sendBack({
                        type: "LOCATION_CHANGED",
                        location: [coords.longitude, coords.latitude],
                        accuracy: coords.accuracy ?? undefined,
                    });
                }
            )
                .then((locationSubscription) => {
                    subscription = locationSubscription;
                })
                .catch((error) => {
                    logger.error("Failed to watch location", error);
                    sendBack({ type: "LOCATION_ERROR" });
                });

            return () => {
                ignore = true;
                subscription?.remove();
            };
        }),
        watchHeading: fromCallback(({ sendBack }: { sendBack: (event: TrackPositionEvent) => void }) => {
            let ignore = false;
            let headingSubscription: Location.LocationSubscription | undefined;

            Location.watchHeadingAsync(({ magHeading }) => {
                if (ignore) {
                    headingSubscription?.remove();
                    return;
                }

                sendBack({
                    type: "HEADING_CHANGED",
                    heading: magHeading,
                });
            })
                .then((subscription) => {
                    headingSubscription = subscription;
                })
                .catch((error) => {
                    logger.error("Failed to watch heading", error);
                });

            return () => {
                ignore = true;
                headingSubscription?.remove();
            };
        }),
        watchAppState: fromCallback(({ sendBack }: { sendBack: (event: TrackPositionEvent) => void }) => {
            let ignore = false;
            let previousStatus: AppStateStatus | undefined;

            const subscription = AppState.addEventListener("change", (status) => {
                if (ignore) {
                    return;
                }

                if (previousStatus !== "background" && status === "background") {
                    sendBack({ type: "APP_BACKGROUNDED" });
                } else if (previousStatus !== "active" && status === "active") {
                    sendBack({ type: "APP_FOREGROUNDED" });
                }

                previousStatus = status;
            });

            return () => {
                ignore = true;
                subscription.remove();
            };
        }),
    },
}).createMachine({
    context: { location: undefined, accuracy: undefined, heading: undefined }, // Added heading to the context
    id: "trackPosition",
    initial: "idle",
    states: {
        idle: {
            on: {
                TOGGLE: { target: "tracking" },
            },
        },
        tracking: {
            exit: ["resetPosition", "removePositionFromMap"],
            type: "parallel",
            states: {
                location: {
                    initial: "verifyingServices",
                    states: {
                        verifyingServices: {
                            invoke: { src: "verifyServices" },
                            on: {
                                SERVICES_ENABLED: { target: "verifyingPermissions" },
                                SERVICES_DISABLED: { target: "#trackPosition.error" },
                                SERVICES_ERROR: { target: "#trackPosition.error" },
                            },
                        },
                        verifyingPermissions: {
                            invoke: { src: "verifyPermissions" },
                            on: {
                                PERMISSIONS_GRANTED: { target: "watchingPosition" },
                                PERMISSIONS_PENDING: { target: "requestingPermissions" },
                                PERMISSIONS_DENIED: { target: "#trackPosition.error" },
                                PERMISSIONS_ERROR: { target: "#trackPosition.error" },
                            },
                        },
                        watchingPosition: {
                            entry: ["activateKeepAwake"],
                            exit: ["deactivateKeepAwake"],
                            invoke: [
                                { src: "watchPosition" },
                                { src: "watchHeading" }, // Added heading watcher
                                { src: "watchAppState" },
                            ],
                            on: {
                                APP_BACKGROUNDED: { target: "paused" },
                                SCREEN_BLUR: { target: "paused" },
                                LOCATION_CHANGED: { actions: ["setLocation", "setPositionOnMap"] },
                                HEADING_CHANGED: { actions: ["setHeading"] }, // Handle heading changes
                                LOCATION_ERROR: { target: "#trackPosition.error" },
                                LOCATION_TIMEOUT: { target: "verifyingServices" },
                            },
                        },
                        paused: {
                            invoke: { src: "watchAppState" },
                            on: {
                                APP_FOREGROUNDED: { target: "verifyingServices" },
                                SCREEN_FOCUS: { target: "verifyingServices" },
                            },
                        },
                        requestingPermissions: {
                            invoke: { src: "requestPermissions" },
                            on: {
                                PERMISSIONS_GRANTED: { target: "watchingPosition" },
                                PERMISSIONS_DENIED: { target: "#trackPosition.error" },
                            },
                        },
                    },
                },
                mode: {
                    initial: "active",
                    states: {
                        active: {
                            on: {
                                MAP_DRAGGED: { target: "background" },
                                TOGGLE: { target: "#trackPosition.idle" },
                            },
                        },
                        background: {
                            on: {
                                TOGGLE: { target: "active", actions: "restorePositionOnMap" },
                            },
                        },
                    },
                },
            },
        },
        error: {
            on: {
                RESET: { target: "idle" },
            },
        },
    },
});
