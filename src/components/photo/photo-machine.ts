import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";
import * as RNIP from "react-native-image-picker";
import { assign, fromCallback, setup } from "xstate";
import { logger } from "~/logger";
import { UserStorage } from "~/user-storage";

const PHOTO_QUALITY = 0.7;

export type PhotoMode = "prompt" | "camera";

type PhotoEvent =
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
    | { type: "CLOSE_PREVIEW" };

export const photoMachine = setup({
    types: {
        context: {} as { photo: string | undefined; mode: PhotoMode; userStorage: UserStorage },
        events: {} as PhotoEvent,
        input: {} as { photo: string | undefined; mode: PhotoMode; userStorage: UserStorage },
    },
    guards: {
        hasPhoto: ({ context }) => context.photo !== undefined,
        isCameraMode: ({ context }) => context.mode === "camera",
    },
    actions: {
        setPhoto: assign({
            photo: ({ context, event }) => {
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
        savePhoto: ({ event }) => {
            if (event.type !== "CAPTURE_PHOTO_SUCCESS") {
                return;
            }

            async function savePhoto(photo: string) {
                const permissions = await MediaLibrary.requestPermissionsAsync(true, ["photo"]);
                if (permissions.status !== MediaLibrary.PermissionStatus.GRANTED) {
                    throw new Error("Permission denied");
                }
                await MediaLibrary.saveToLibraryAsync(photo);
            }

            savePhoto(event.photo)
                .then(() => {
                    logger.log("Photo saved to library");
                })
                .catch((error) => {
                    logger.error("Failed to save photo to library", error);
                });
        },
        onPhotoSelectOpen: () => {
            // handled externally
        },
        onPhotoSelectClose: () => {
            // handled externally
        },
        onPhotoSelected: () => {
            // handled externally
        },
        onPhotoDeleted: () => {
            // handled externally
        },
    },
    actors: {
        verifyCameraPermissions: fromCallback(({ sendBack }: { sendBack: (event: PhotoEvent) => void }) => {
            ImagePicker.getCameraPermissionsAsync()
                .then((result) => {
                    if (result.status === "granted") {
                        sendBack({ type: "CAMERA_PERMISSION_GRANTED" });
                    } else if (result.status === "undetermined") {
                        sendBack({ type: "CAMERA_PERMISSION_PENDING" });
                    } else if (result.status === "denied") {
                        // On Android 10 and above, the user can choose option "Ask every time", which returns status: "denied" and canAskAgain: false
                        // This issue has been reported here: https://github.com/expo/expo/issues/19047
                        if (result.canAskAgain || (Platform.OS === "android" && Platform.Version >= 29)) {
                            sendBack({ type: "CAMERA_PERMISSION_PENDING" });
                        } else {
                            sendBack({ type: "CAMERA_PERMISSION_DENIED" });
                        }
                    } else {
                        sendBack({ type: "CAMERA_PERMISSION_DENIED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to get camera permissions", error);
                    sendBack({ type: "CAMERA_PERMISSION_DENIED" });
                });
        }),
        requestCameraPermissions: fromCallback(({ sendBack }: { sendBack: (event: PhotoEvent) => void }) => {
            ImagePicker.requestCameraPermissionsAsync()
                .then((result) => {
                    if (result.status === "granted") {
                        sendBack({ type: "CAMERA_PERMISSION_GRANTED" });
                    } else {
                        sendBack({ type: "CAMERA_PERMISSION_DENIED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to request camera permissions", error);
                    sendBack({ type: "CAMERA_PERMISSION_DENIED" });
                });
        }),
        capturePhoto: fromCallback(
            ({ sendBack, input }: { sendBack: (event: PhotoEvent) => void; input: { userStorage: UserStorage } }) => {
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
                                input.userStorage.setPendingPhotoUri(uri);
                                sendBack({ type: "CAPTURE_PHOTO_SUCCESS", photo: uri });
                            } else if (result.didCancel) {
                                sendBack({ type: "CAPTURE_PHOTO_CANCELLED" });
                            } else {
                                logger.error("Failed to capture photo, invalid result", result);
                                sendBack({ type: "CAPTURE_PHOTO_FAILURE" });
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to capture photo", error);
                            sendBack({ type: "CAPTURE_PHOTO_FAILURE" });
                        });
                } else {
                    ImagePicker.launchCameraAsync({
                        quality: PHOTO_QUALITY,
                    })
                        .then((result) => {
                            if (result.canceled) {
                                sendBack({ type: "CAPTURE_PHOTO_CANCELLED" });
                            } else if (result.assets.length > 0) {
                                sendBack({ type: "CAPTURE_PHOTO_SUCCESS", photo: result.assets[0].uri });
                            } else {
                                sendBack({ type: "CAPTURE_PHOTO_FAILURE" });
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to capture photo", error);
                            sendBack({ type: "CAPTURE_PHOTO_FAILURE" });
                        });
                }
            }
        ),
        verifyMediaPermissions: fromCallback(({ sendBack }: { sendBack: (event: PhotoEvent) => void }) => {
            ImagePicker.getMediaLibraryPermissionsAsync()
                .then((result) => {
                    if (result.status === "granted") {
                        sendBack({ type: "MEDIA_PERMISSION_GRANTED" });
                    } else if (result.status === "undetermined") {
                        sendBack({ type: "MEDIA_PERMISSION_PENDING" });
                    } else if (result.status === "denied") {
                        // On Android 10 and above, the user can choose option "Ask every time", which returns status: "denied" and canAskAgain: false
                        // This issue has been reported here: https://github.com/expo/expo/issues/19047
                        if (result.canAskAgain || (Platform.OS === "android" && Platform.Version >= 29)) {
                            sendBack({ type: "MEDIA_PERMISSION_PENDING" });
                        } else {
                            sendBack({ type: "MEDIA_PERMISSION_DENIED" });
                        }
                    } else {
                        sendBack({ type: "MEDIA_PERMISSION_DENIED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to get media permissions", error);
                    sendBack({ type: "MEDIA_PERMISSION_DENIED" });
                });
        }),
        requestMediaPermissions: fromCallback(({ sendBack }: { sendBack: (event: PhotoEvent) => void }) => {
            ImagePicker.requestMediaLibraryPermissionsAsync()
                .then((result) => {
                    if (result.status === "granted") {
                        sendBack({ type: "MEDIA_PERMISSION_GRANTED" });
                    } else {
                        sendBack({ type: "MEDIA_PERMISSION_DENIED" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to request media permissions", error);
                    sendBack({ type: "MEDIA_PERMISSION_DENIED" });
                });
        }),
        choosePhoto: fromCallback(
            ({ sendBack, input }: { sendBack: (event: PhotoEvent) => void; input: { userStorage: UserStorage } }) => {
                if (Platform.OS === "android") {
                    RNIP.launchImageLibrary({
                        quality: PHOTO_QUALITY,
                        mediaType: "photo",
                    })
                        .then((result) => {
                            if (result.assets && result.assets[0].uri) {
                                const uri = result.assets[0].uri;
                                // Persist the URI so that it can be used when activity restarts
                                input.userStorage.setPendingPhotoUri(uri);
                                sendBack({ type: "CHOOSE_PHOTO_SUCCESS", photo: uri });
                            } else if (result.didCancel) {
                                sendBack({ type: "CHOOSE_PHOTO_CANCELLED" });
                            } else {
                                logger.error("Failed to choose photo, invalid result", result);
                                sendBack({ type: "CHOOSE_PHOTO_FAILURE" });
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to choose photo", error);
                            sendBack({ type: "CHOOSE_PHOTO_FAILURE" });
                        });
                } else {
                    ImagePicker.launchImageLibraryAsync({
                        quality: PHOTO_QUALITY,
                    })
                        .then((result) => {
                            if (result.canceled) {
                                sendBack({ type: "CHOOSE_PHOTO_CANCELLED" });
                            } else if (result.assets.length > 0) {
                                sendBack({ type: "CHOOSE_PHOTO_SUCCESS", photo: result.assets[0].uri });
                            } else {
                                sendBack({ type: "CHOOSE_PHOTO_FAILURE" });
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to pick photo", error);
                            sendBack({ type: "CHOOSE_PHOTO_FAILURE" });
                        });
                }
            }
        ),
    },
}).createMachine({
    id: "photo",
    context: ({ input }) => ({ photo: input.photo, mode: input.mode, userStorage: input.userStorage }),
    initial: "loading",
    states: {
        loading: {
            always: [{ guard: "hasPhoto", target: "selected" }, { target: "empty" }],
        },
        empty: {
            initial: "idle",
            states: {
                idle: {
                    on: {
                        SELECT_PHOTO: [{ guard: "isCameraMode", target: "capturing" }, { target: "prompting" }],
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
                            invoke: {
                                src: "capturePhoto",
                                input: ({ context }) => ({ userStorage: context.userStorage }),
                            },
                            on: {
                                CAPTURE_PHOTO_SUCCESS: {
                                    target: "#photo.selected",
                                    actions: ["setPhoto", "onPhotoSelected", "savePhoto"],
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
                            invoke: {
                                src: "choosePhoto",
                                input: ({ context }) => ({ userStorage: context.userStorage }),
                            },
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
});
