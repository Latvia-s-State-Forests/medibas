import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import * as RNIP from "react-native-image-picker";
import { assign, createMachine } from "xstate";
import { logger } from "~/logger";
import { UserStorage } from "~/user-storage";

const PHOTO_QUALITY = 0.7;

export type PhotoMode = "prompt" | "camera";

export const photoMachine = createMachine(
    {
        id: "photo",
        schema: {
            context: {} as {
                photo: string | undefined;
                mode: PhotoMode;
                userStorage: UserStorage;
            },
            events: {} as
                | { type: "xstate.stop" } // Used to ignore onPhotoSelectClose when Android activity restarts
                | { type: "SELECT_PHOTO" }
                | { type: "PROMPT_CANCELLED" }
                | { type: "DELETE_PHOTO" }
                | { type: "DELETE_CONFIRMED" }
                | { type: "DELETE_REJECTED" }
                | { type: "CAPTURE_PHOTO" }
                | { type: "CAPTURE_PHOTO_SUCCESS"; photo: string }
                | { type: "CAPTURE_PHOTO_FAILURE" }
                | { type: "CAPTURE_PHOTO_CANCELLED" }
                | { type: "CHOOSE_PHOTO" }
                | { type: "CHOOSE_PHOTO_SUCCESS"; photo: string }
                | { type: "CHOOSE_PHOTO_FAILURE" }
                | { type: "CHOOSE_PHOTO_CANCELLED" }
                | { type: "ERROR_OPEN_SETTINGS" }
                | { type: "ERROR_CLOSE" }
                | { type: "CAMERA_PERMISSION_PENDING" }
                | { type: "CAMERA_PERMISSION_GRANTED" }
                | { type: "CAMERA_PERMISSION_DENIED" }
                | { type: "MEDIA_PERMISSION_PENDING" }
                | { type: "MEDIA_PERMISSION_GRANTED" }
                | { type: "MEDIA_PERMISSION_DENIED" }
                | { type: "OPEN_PREVIEW" }
                | { type: "CLOSE_PREVIEW" },
        },
        initial: "loading",
        states: {
            loading: {
                always: [{ cond: "hasPhoto", target: "selected" }, { target: "empty" }],
            },
            empty: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            SELECT_PHOTO: [{ cond: "isCameraMode", target: "capturing" }, { target: "prompting" }],
                        },
                    },
                    prompting: {
                        on: {
                            CAPTURE_PHOTO: "capturing",
                            CHOOSE_PHOTO: "choosing",
                            PROMPT_CANCELLED: "idle",
                        },
                    },
                    capturing: {
                        initial: "verifyingPermissions",
                        states: {
                            verifyingPermissions: {
                                invoke: { src: "verifyCameraPermissions" },
                                on: {
                                    CAMERA_PERMISSION_PENDING: "requestingPermissions",
                                    CAMERA_PERMISSION_GRANTED: "pendingDelay",
                                    CAMERA_PERMISSION_DENIED: "#photo.empty.error",
                                },
                            },
                            requestingPermissions: {
                                invoke: { src: "requestCameraPermissions" },
                                on: {
                                    CAMERA_PERMISSION_GRANTED: "pendingDelay",
                                    CAMERA_PERMISSION_DENIED: "#photo.empty.error",
                                },
                            },
                            // Prevent having two modals open at the same time, which causes modal bugs on iOS
                            pendingDelay: {
                                after: {
                                    100: "capturing",
                                },
                            },
                            capturing: {
                                entry: "onPhotoSelectOpen",
                                exit: "onPhotoSelectClose",
                                invoke: { src: "capturePhoto" },
                                on: {
                                    CAPTURE_PHOTO_SUCCESS: {
                                        target: "#photo.selected",
                                        actions: ["setPhoto", "onPhotoSelected"],
                                    },
                                    CAPTURE_PHOTO_FAILURE: "#photo.empty.error",
                                    CAPTURE_PHOTO_CANCELLED: "#photo.empty.idle",
                                },
                            },
                        },
                    },
                    choosing: {
                        initial: "verifyingPermissions",
                        states: {
                            verifyingPermissions: {
                                invoke: { src: "verifyMediaPermissions" },
                                on: {
                                    MEDIA_PERMISSION_PENDING: "requestingPermissions",
                                    MEDIA_PERMISSION_GRANTED: "pendingDelay",
                                    MEDIA_PERMISSION_DENIED: "#photo.empty.error",
                                },
                            },
                            requestingPermissions: {
                                invoke: { src: "requestMediaPermissions" },
                                on: {
                                    MEDIA_PERMISSION_GRANTED: "pendingDelay",
                                    MEDIA_PERMISSION_DENIED: "#photo.empty.error",
                                },
                            },
                            // Prevent having two modals open at the same time, which causes modal bugs on iOS
                            pendingDelay: {
                                after: {
                                    100: "choosing",
                                },
                            },
                            choosing: {
                                entry: "onPhotoSelectOpen",
                                exit: "onPhotoSelectClose",
                                invoke: { src: "choosePhoto" },
                                on: {
                                    CHOOSE_PHOTO_SUCCESS: {
                                        target: "#photo.selected",
                                        actions: ["setPhoto", "onPhotoSelected"],
                                    },
                                    CHOOSE_PHOTO_FAILURE: "#photo.empty.error",
                                    CHOOSE_PHOTO_CANCELLED: "#photo.empty.idle",
                                },
                            },
                        },
                    },
                    error: {
                        on: {
                            ERROR_OPEN_SETTINGS: { target: "idle", actions: "openSettings" },
                            ERROR_CLOSE: "idle",
                        },
                    },
                },
            },
            selected: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            OPEN_PREVIEW: "previewing",
                            DELETE_PHOTO: "confirmingDelete",
                        },
                    },
                    previewing: {
                        on: {
                            CLOSE_PREVIEW: "idle",
                        },
                    },
                    confirmingDelete: {
                        on: {
                            DELETE_CONFIRMED: { target: "#photo.empty", actions: ["resetPhoto", "onPhotoDeleted"] },
                            DELETE_REJECTED: "idle",
                        },
                    },
                },
            },
        },
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        guards: {
            hasPhoto: (context) => context.photo !== undefined,
            isCameraMode: (context) => context.mode === "camera",
        },
        actions: {
            setPhoto: assign({
                photo: (context, event) => {
                    if (event.type === "CAPTURE_PHOTO_SUCCESS" || event.type === "CHOOSE_PHOTO_SUCCESS") {
                        return event.photo;
                    }
                    return context.photo;
                },
            }),
            resetPhoto: assign({
                photo: undefined,
            }),
            openSettings: () => {
                Linking.openSettings();
            },
        },
        services: {
            verifyCameraPermissions: () => (send) => {
                ImagePicker.getCameraPermissionsAsync()
                    .then((result) => {
                        if (result.status === "granted") {
                            send("CAMERA_PERMISSION_GRANTED");
                        } else if (result.status === "undetermined") {
                            send("CAMERA_PERMISSION_PENDING");
                        } else if (result.status === "denied") {
                            // On Android 10 and above, the user can choose option "Ask every time", which returns status: "denied" and canAskAgain: false
                            // This issue has been reported here: https://github.com/expo/expo/issues/19047
                            if (result.canAskAgain || (Platform.OS === "android" && Platform.Version >= 29)) {
                                send("CAMERA_PERMISSION_PENDING");
                            } else {
                                send("CAMERA_PERMISSION_DENIED");
                            }
                        } else {
                            send("CAMERA_PERMISSION_DENIED");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to get camera permissions", error);
                        send("CAMERA_PERMISSION_DENIED");
                    });
            },
            requestCameraPermissions: () => (send) => {
                ImagePicker.requestCameraPermissionsAsync()
                    .then((result) => {
                        if (result.status === "granted") {
                            send("CAMERA_PERMISSION_GRANTED");
                        } else {
                            send("CAMERA_PERMISSION_DENIED");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to request camera permissions", error);
                        send("CAMERA_PERMISSION_DENIED");
                    });
            },
            capturePhoto: (context) => (send) => {
                if (Platform.OS === "android") {
                    RNIP.launchCamera({
                        quality: PHOTO_QUALITY,
                        mediaType: "photo",
                        cameraType: "back",
                    })
                        .then((result) => {
                            if (result.assets && result.assets[0].uri) {
                                const uri = result.assets[0].uri;
                                // Persist the URI so that it can be used when activity restarts
                                context.userStorage.setPendingPhotoUri(uri);
                                send({ type: "CAPTURE_PHOTO_SUCCESS", photo: uri });
                            } else if (result.didCancel) {
                                send("CAPTURE_PHOTO_CANCELLED");
                            } else {
                                logger.error("Failed to capture photo, invalid result", result);
                                send("CAPTURE_PHOTO_FAILURE");
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to capture photo", error);
                            send("CAPTURE_PHOTO_FAILURE");
                        });
                } else {
                    ImagePicker.launchCameraAsync({
                        quality: PHOTO_QUALITY,
                    })
                        .then((result) => {
                            if (result.canceled) {
                                send("CAPTURE_PHOTO_CANCELLED");
                            } else if (result.assets.length > 0) {
                                send({ type: "CAPTURE_PHOTO_SUCCESS", photo: result.assets[0].uri });
                            } else {
                                send("CAPTURE_PHOTO_FAILURE");
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to capture photo", error);
                            send("CAPTURE_PHOTO_FAILURE");
                        });
                }
            },
            verifyMediaPermissions: () => (send) => {
                ImagePicker.getMediaLibraryPermissionsAsync()
                    .then((result) => {
                        if (result.status === "granted") {
                            send("MEDIA_PERMISSION_GRANTED");
                        } else if (result.status === "undetermined") {
                            send("MEDIA_PERMISSION_PENDING");
                        } else if (result.status === "denied") {
                            // On Android 10 and above, the user can choose option "Ask every time", which returns status: "denied" and canAskAgain: false
                            // This issue has been reported here: https://github.com/expo/expo/issues/19047
                            if (result.canAskAgain || (Platform.OS === "android" && Platform.Version >= 29)) {
                                send("MEDIA_PERMISSION_PENDING");
                            } else {
                                send("MEDIA_PERMISSION_DENIED");
                            }
                        } else {
                            send("MEDIA_PERMISSION_DENIED");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to get media permissions", error);
                        send("MEDIA_PERMISSION_DENIED");
                    });
            },
            requestMediaPermissions: () => (send) => {
                ImagePicker.requestMediaLibraryPermissionsAsync()
                    .then((result) => {
                        if (result.status === "granted") {
                            send("MEDIA_PERMISSION_GRANTED");
                        } else {
                            send("MEDIA_PERMISSION_DENIED");
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to request media permissions", error);
                        send("MEDIA_PERMISSION_DENIED");
                    });
            },
            choosePhoto: (context) => (send) => {
                if (Platform.OS === "android") {
                    RNIP.launchImageLibrary({
                        quality: PHOTO_QUALITY,
                        mediaType: "photo",
                    })
                        .then((result) => {
                            if (result.assets && result.assets[0].uri) {
                                const uri = result.assets[0].uri;
                                // Persist the URI so that it can be used when activity restarts
                                context.userStorage.setPendingPhotoUri(uri);
                                send({ type: "CHOOSE_PHOTO_SUCCESS", photo: uri });
                            } else if (result.didCancel) {
                                send("CHOOSE_PHOTO_CANCELLED");
                            } else {
                                logger.error("Failed to choose photo, invalid result", result);
                                send("CHOOSE_PHOTO_FAILURE");
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to choose photo", error);
                            send("CHOOSE_PHOTO_FAILURE");
                        });
                } else {
                    ImagePicker.launchImageLibraryAsync({
                        quality: PHOTO_QUALITY,
                    })
                        .then((result) => {
                            if (result.canceled) {
                                send("CHOOSE_PHOTO_CANCELLED");
                            } else if (result.assets.length > 0) {
                                send({ type: "CHOOSE_PHOTO_SUCCESS", photo: result.assets[0].uri });
                            } else {
                                send("CHOOSE_PHOTO_FAILURE");
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to pick photo", error);
                            send("CHOOSE_PHOTO_FAILURE");
                        });
                }
            },
        },
    }
);
