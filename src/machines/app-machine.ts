import { IBMPlexSans_400Regular, IBMPlexSans_700Bold } from "@expo-google-fonts/ibm-plex-sans";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ExpoFont from "expo-font";
import "react-native-gesture-handler";
import { match } from "ts-pattern";
import { fromCallback, setup } from "xstate";
import { api } from "~/api";
import { appStorage } from "~/app-storage";
import { initI18n } from "~/i18n";
import { logger } from "~/logger";
import { authenticationActor } from "~/machines/authentication-machine";
import { mapActor } from "~/machines/map-machine";
import { AppUpdateStatus } from "~/types/versions";
import { checkAppVersion } from "~/utils/check-app-version";
import { getAppVersion } from "~/utils/get-app-version";

type AppEvent =
    | { type: "APP_UP_TO_DATE" }
    | { type: "APP_UPDATE_AVAILABLE" }
    | { type: "APP_UPDATE_REQUIRED" }
    | { type: "APP_UPDATE_FAILED" }
    | { type: "POSTPONE_UPDATE" }
    | { type: "DATA_MIGRATION_PERFORMED" }
    | { type: "DATA_MIGRATION_PENDING" }
    | { type: "DATA_MIGRATION_SUCCESS" }
    | { type: "DATA_MIGRATION_FAILURE" }
    | { type: "SERVICES_INITIALIZED" }
    | { type: "FONT_INITIALIZATION_SUCCESS" }
    | { type: "FONT_INITIALIZATION_FAILURE" }
    | { type: "I18N_INITIALIZED" }
    | { type: "LANGUAGE_SELECTED" }
    | { type: "LANGUAGE_NOT_SELECTED" };

export const appMachine = setup({
    types: {
        events: {} as AppEvent,
    },
    actions: {
        logAppVersion: () => {
            const applicationName = Constants.expoConfig?.name ?? "Mednis";
            const applicationVersion = getAppVersion();
            const manufacturer = Device.manufacturer;
            const modelName = Device.modelName;
            const osName = Device.osName;
            const deviceName = Device.deviceName;
            const osVersion = Device.osVersion;
            const message = `${applicationName} ${applicationVersion} started`;
            const deviceInfo = {
                manufacturer,
                modelName,
                deviceName,
                osName,
                osVersion,
            };
            logger.log(message, deviceInfo);
        },
    },
    actors: {
        checkAppVersion: fromCallback(({ sendBack }: { sendBack: (event: AppEvent) => void }) => {
            if (__DEV__) {
                sendBack({ type: "APP_UP_TO_DATE" });
                return;
            }

            const appVersion = Application.nativeApplicationVersion;
            if (!appVersion) {
                logger.error(`Application.nativeApplicationVersion is not available`);
                sendBack({ type: "APP_UPDATE_FAILED" });
                return;
            }

            api.getVersions()
                .then((availableVersions) => {
                    const updateState = checkAppVersion(appVersion, availableVersions);

                    match(updateState)
                        .with(AppUpdateStatus.Mandatory, () => sendBack({ type: "APP_UPDATE_REQUIRED" }))
                        .with(AppUpdateStatus.Optional, () => sendBack({ type: "APP_UPDATE_AVAILABLE" }))
                        .with(AppUpdateStatus.UpToDate, () => sendBack({ type: "APP_UP_TO_DATE" }))
                        .with(AppUpdateStatus.Failed, () => {
                            logger.error("Failed to check app version, invalid range");
                            sendBack({ type: "APP_UPDATE_FAILED" });
                        });
                })
                .catch((error) => {
                    logger.error("Failed to check app version", error);
                    sendBack({ type: "APP_UPDATE_FAILED" });
                });
        }),
        verifyLanguage: fromCallback(({ sendBack }: { sendBack: (event: AppEvent) => void }) => {
            const language = appStorage.getLanguage();
            if (language) {
                sendBack({ type: "LANGUAGE_SELECTED" });
            } else {
                sendBack({ type: "LANGUAGE_NOT_SELECTED" });
            }
        }),
        initializeServices: fromCallback(({ sendBack }: { sendBack: (event: AppEvent) => void }) => {
            authenticationActor.start();
            mapActor.start();
            sendBack({ type: "SERVICES_INITIALIZED" });
        }),
        initializeFonts: fromCallback(({ sendBack }: { sendBack: (event: AppEvent) => void }) => {
            ExpoFont.loadAsync({ IBMPlexSans_400Regular, IBMPlexSans_700Bold })
                .then(() => {
                    sendBack({ type: "FONT_INITIALIZATION_SUCCESS" });
                })
                .catch((error) => {
                    logger.error("Failed to initialize fonts", error);
                    sendBack({ type: "FONT_INITIALIZATION_FAILURE" });
                });
        }),
        initializeI18n: fromCallback(({ sendBack }: { sendBack: (event: AppEvent) => void }) => {
            const language = appStorage.getLanguage();
            initI18n(language);
            sendBack({ type: "I18N_INITIALIZED" });
        }),
    },
}).createMachine({
    id: "app",

    initial: "loading",
    states: {
        loading: {
            initial: "loggingAppVersion",
            states: {
                loggingAppVersion: {
                    always: {
                        target: "initializingServices",
                        actions: ["logAppVersion"],
                    },
                },
                initializingServices: {
                    invoke: { src: "initializeServices" },
                    on: {
                        SERVICES_INITIALIZED: "initializingFonts",
                    },
                },
                initializingFonts: {
                    invoke: { src: "initializeFonts" },
                    on: {
                        FONT_INITIALIZATION_SUCCESS: "initializingI18n",
                        FONT_INITIALIZATION_FAILURE: "initializingI18n",
                    },
                },
                initializingI18n: {
                    invoke: { src: "initializeI18n" },
                    on: {
                        I18N_INITIALIZED: "verifyingLanguage",
                    },
                },
                verifyingLanguage: {
                    invoke: { src: "verifyLanguage" },
                    on: {
                        LANGUAGE_SELECTED: "#app.checkingAppVersion",
                        LANGUAGE_NOT_SELECTED: "#app.selectingLanguage",
                    },
                },
            },
        },
        selectingLanguage: {
            on: {
                LANGUAGE_SELECTED: "#app.checkingAppVersion",
            },
        },
        checkingAppVersion: {
            initial: "verifyingNetworkConnection",
            states: {
                verifyingNetworkConnection: {
                    invoke: { src: "checkAppVersion" },
                    on: {
                        APP_UP_TO_DATE: "#app.initialized",
                        APP_UPDATE_AVAILABLE: "updateAvailable",
                        APP_UPDATE_REQUIRED: "updateRequired",
                        APP_UPDATE_FAILED: "#app.initialized",
                    },
                },
                updateAvailable: {
                    on: {
                        POSTPONE_UPDATE: "#app.initialized",
                    },
                },
                updateRequired: {},
            },
        },
        initialized: {
            type: "final",
        },
    },
});
