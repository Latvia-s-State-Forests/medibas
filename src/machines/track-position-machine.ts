import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Location from "expo-location";
import GeoJSON from "geojson";
import { AppState, AppStateStatus, Platform } from "react-native";
import { assign, createMachine } from "xstate";
import { logger } from "~/logger";

export const trackPositionMachine =
    /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAxgawAoHtYBLZI-AOwDoiIAbMAYgBUB5AcTYBkBRAbQAYAuolAAHQiTLkRIAB6IATADYArABZKCgMwBONVq38AHEqML+SgDQgAnojOUdSrSoU6jO-jp0GAvr+s0LDwJUgpKIJwicihKWnxMdDCqADcwVCIAMxtoqABldJSiTDgGPO4AJQA1AEkAYW48gH1uADkAQQAhHgARAWEkEHFiZJl5BC0lAHZKAEZDWaN+FS0TBQV1azsEIymFSi11nVmlfknFrTV-QIwcAhGpCNvsXLiEpMe0jOzcgtQikqwMqVWoNZo9Gp5Lq9foyYaSChjRSHWaaIxaKaHdRTHQqKZTLaIWYbLSUFRmNRGMxnVy464gSIhB7hRmveKJZKUL5ZHIxP4A0rlar1RotCoVFgVWGDeGjQbjbQKVEKdGYjZqHF4gm2RBqNT8ShmDFUtxGeYKKZXAIM573BFUVkxN4cz7pHm5XDpAC2RFgxAoQNwlQAspC8jUWK1mmwKu1WkxuH0hHDQlIkTstKinMYTFTLYYtISdmoVIa1M5TsZ1lNFvTGXbOY7YuyPuFuT8Yp7UD6-VJAyGwxGo00g60Ia02NKxKnEfL7JnHKcqaZdvozkXvAadJjvOt+MoLTo67aZw7nmz3pz27yoF2e-7yP2KqG8uHI+C2jVE1Ohqf04rlVVLENVxfEi1mWY1B0ShTCUVQ8W8eYpmPYIG0eJtnVbVI3Q7W9vV9B8nxfN9h0qCUpWTGU-znBAALRDFgM1MCdQQYl+FRZwSz2fh2IMPxrXrU8nmCC8XXCAB3JJMAACw9U8GHaXBcCaTp2jqABpGMWAAVTHb9KOnZlpBo2YpiMUsTl0dQVG8XRpiLIw1A4tRtFUEtZnJKYlBQu4hIwltOUk5AZLkoyGFwFhwyYIcmjqAAJOM2H0gZDPtdMPKUaDlgsEwnJcCDZiLTLUX4KCVHYyClHmFQfKZe1hKiJ0AseIKQs7eSIqimKyMlH9ZTTGi6JVBj1SY7VticUkIOcbQVFcUxyVqtCWXPJrLxaqTZPasLOpqaLIyaaLg24HSmD66jQHGaqlDJTNZh8dj0RccbEGKyhStxCry3mSklr81bm3W8JRHQABXWBIAUpSmgAMUlbgtN0npkpTIz0rM0s5pLDwnDgosVEyskpixwwSzOaY-qMhqXjWsSqFQMAAEdQbgUhO3w3sA3CgdXyHaNY3jFGqLRkyUTJJwLVcXRPGJDcvM0JQNTNMrHI2Sn6v8oH6aZlnYDZvDuwIvtuefQd3yaZHWi-JMUt-EXLuRJV6LVbFQJe1ivBmTFdispw9GMdXGwBygvXwCAwEoLBSDSBhg0UppgxYKohdSuUHdY3NKH0JVbIl4lCpY+Z3EofFdmUXdpncQP0OD0Pw8jzBo8YVgOB4c77bkR3AJG12tXA1wDQ2ZRzK8DF8WQgSTypjC64jgAjYIoFQfBQfICBmHYLg+AMu20pMzPs-unw86VcC3GglZjhcpUzkuWZq-CdJl9QBgKkabgzp3-rZ3T5R1E0XQ+hDC5nMFYQusweKOBUBBKYPF8T7mcP4a05Aw5wBkIJKmNB6Coz3r-fE0EXKmU9s4ckCg1DgQgaSHwZpIJmmJmQowD8zwiVplhLkOEbz8mKGg4WuDO6sVMkWPURhNBzSVCsJCZCtBMOpqJNh14PQc0IjgtO-C8Q3ROHBDYJx8QljAdsRyIi4I6BVDmfgXkFAyM1nTSgrUtq3gurvVRV0Cb7HMBSCx24ViFhYkacWJCzgV1cFY4OzVgZgwhhAFRA1f48REYcJYGw8Tokgj47YrjNDbktM4XcwCQksMBjYhmzNWaKMNpzR80Sf78IgXsImKobIWj2GYFQG5pgHHMJmM0T1MpHknqhf6BTMKqO-sZdOmUiwuGgm4E4c1XCWj2GQ-JjVYizwbk3KpYyanE1LGYJYpk9DEyguBAw+wnLqEpBA7KcFlk01WagygC8cBLxXmvTZ-4vAGnxDZPUGpyzEzSUSU570eLbk+jZCw99+m+WnrXVB7yTKwJmHs9iOINTqB0GfCBRM5oUjIVWW5uQEW-wLtsHRWcMSUhxCYrwlUZFP3wKgYl-CNiqA6Y9Qw0C8zkPAexClNDLn0N+tCuqIzHHjAALQWiLBK7ySCgA */
    createMachine(
        {
            context: { location: undefined, accuracy: undefined, heading: undefined }, // Added heading to the context
            schema: {
                context: {} as { location?: GeoJSON.Position; accuracy?: number; heading?: number }, // Heading is now part of context
                events: {} as
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
                    | { type: "TOGGLE" },
            },
            preserveActionOrder: true,
            predictableActionArguments: true,
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
        },
        {
            actions: {
                setLocation: assign((context, event) => {
                    if (event.type !== "LOCATION_CHANGED") {
                        return context;
                    }
                    return { location: event.location, accuracy: event.accuracy };
                }),
                setHeading: assign((context, event) => {
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
                            logger.error("Failed to request permissions", error);
                            send("PERMISSIONS_ERROR");
                        });

                    return () => {
                        ignore = true;
                    };
                },
                watchPosition: () => (send) => {
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

                            send({
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
                            send("LOCATION_ERROR");
                        });

                    return () => {
                        ignore = true;
                        subscription?.remove();
                    };
                },
                watchHeading: () => (send) => {
                    let ignore = false;
                    let headingSubscription: Location.LocationSubscription | undefined;

                    Location.watchHeadingAsync(({ magHeading }) => {
                        if (ignore) {
                            headingSubscription?.remove();
                            return;
                        }

                        send({
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
                },
                watchAppState: () => (send) => {
                    let ignore = false;
                    let previousStatus: AppStateStatus | undefined;

                    const subscription = AppState.addEventListener("change", (status) => {
                        if (ignore) {
                            return;
                        }

                        if (previousStatus !== "background" && status === "background") {
                            send("APP_BACKGROUNDED");
                        } else if (previousStatus !== "active" && status === "active") {
                            send("APP_FOREGROUNDED");
                        }

                        previousStatus = status;
                    });

                    return () => {
                        ignore = true;
                        subscription.remove();
                    };
                },
            },
        }
    );
