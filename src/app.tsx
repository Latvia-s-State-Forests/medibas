import { IBMPlexSans_400Regular, IBMPlexSans_700Bold } from "@expo-google-fonts/ibm-plex-sans";
import { NavigationContainer } from "@react-navigation/native";
import { useMachine } from "@xstate/react";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ExpoFont from "expo-font";
import * as React from "react";
import "react-native-gesture-handler";
import { match } from "ts-pattern";
import { createMachine } from "xstate";
import { MapSettingsProvider } from "~/hooks/use-map-settings";
import { SpeciesContext, useSpecies } from "~/hooks/use-species";
import { RootNavigator } from "~/navigation/root-navigator";
import { SplashScreen } from "~/screens/splash-screen";
import { api } from "./api";
import { appStorage } from "./app-storage";
import { ConfirmationDialogProvider } from "./components/confirmation-dialog-provider";
import { HuntActivitiesProvider } from "./components/hunt-activities-provider";
import { InfrastructureProvider } from "./components/infrastructure-provider";
import { ReportsProvider } from "./components/reports-provider";
import { ClassifiersContext } from "./hooks/use-classifiers";
import { useClassifiersQuery } from "./hooks/use-classifiers-query";
import { ConfigContext } from "./hooks/use-config";
import { useConfigQuery } from "./hooks/use-config-query";
import { ContractsContext } from "./hooks/use-contracts";
import { useContractsQuery } from "./hooks/use-contracts-query";
import { DistrictDamagesContext } from "./hooks/use-district-damages";
import { useDistrictDamagesQuery } from "./hooks/use-district-damages-query";
import { DistrictsContext } from "./hooks/use-districts";
import { useDistrictsQuery } from "./hooks/use-districts-query";
import { FeaturesContext } from "./hooks/use-features";
import { useFeaturesQuery } from "./hooks/use-features-query";
import { HuntedAnimalsContext } from "./hooks/use-hunted-animals";
import { useHuntedAnimalsQuery } from "./hooks/use-hunted-animals-query";
import { HuntsProvider } from "./hooks/use-hunts";
import { useHuntsQuery } from "./hooks/use-hunts-query";
import { useInfrastructureQuery } from "./hooks/use-infrastructure-query";
import { useInitialNavigationState } from "./hooks/use-initial-navigation-state";
import { MembershipsContext } from "./hooks/use-memberships";
import { useMembershipsQuery } from "./hooks/use-memberships-query";
import { NewsProvider } from "./hooks/use-news";
import { PermitsContext } from "./hooks/use-permits";
import { usePermitsQuery } from "./hooks/use-permits-query";
import { ProfileContext } from "./hooks/use-profile";
import { useProfileQuery } from "./hooks/use-profile-query";
import { SelectedDistrictIdProvider } from "./hooks/use-selected-district-id";
import { useConfigureStatusBar } from "./hooks/use-status-bar";
import "./i18n";
import { initI18n } from "./i18n";
import { logger } from "./logger";
import { authenticationService, useAuth } from "./machines/authentication-machine";
import { mapService } from "./machines/map-machine";
import { InitialLoadingActiveScreen, InitialLoadingFailedScreen } from "./screens/initial-loading-screen";
import { LanguageSelectScreen } from "./screens/language-select-screen";
import { LoginScreen } from "./screens/login-screen";
import { PinValidatorScreen } from "./screens/pin/pin-validator-screen";
import { UpdateScreen } from "./screens/update-screen";
import { AppUpdateStatus } from "./types/versions";
import { checkAppVersion } from "./utils/check-app-version";
import { getAppVersion } from "./utils/get-app-version";

const appMachine = createMachine(
    {
        id: "app",
        schema: {
            events: {} as
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
                | { type: "LANGUAGE_NOT_SELECTED" },
        },
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
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
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
        services: {
            checkAppVersion: () => async (send) => {
                if (__DEV__) {
                    send("APP_UP_TO_DATE");
                    return;
                }
                try {
                    const appVersion = Application.nativeApplicationVersion;
                    if (!appVersion) {
                        logger.error(`Application.nativeApplicationVersion is not available`);
                        send("APP_UPDATE_FAILED");
                        return;
                    }
                    const availableVersions = await api.getVersions();

                    const updateState = checkAppVersion(appVersion, availableVersions);

                    match(updateState)
                        .with(AppUpdateStatus.Mandatory, () => send("APP_UPDATE_REQUIRED"))
                        .with(AppUpdateStatus.Optional, () => send("APP_UPDATE_AVAILABLE"))
                        .with(AppUpdateStatus.UpToDate, () => send("APP_UP_TO_DATE"))
                        .with(AppUpdateStatus.Failed, () => {
                            logger.error("Failed to check app version, invalid range");
                            send("APP_UPDATE_FAILED");
                        });
                } catch (error) {
                    logger.error("Failed to check app version", error);
                    send("APP_UPDATE_FAILED");
                }
            },
            verifyLanguage: () => (send) => {
                const language = appStorage.getLanguage();
                if (language) {
                    send("LANGUAGE_SELECTED");
                } else {
                    send("LANGUAGE_NOT_SELECTED");
                }
            },
            initializeServices: () => async (send) => {
                authenticationService.start();
                mapService.start();
                send("SERVICES_INITIALIZED");
            },
            initializeFonts: () => async (send) => {
                try {
                    await ExpoFont.loadAsync({ IBMPlexSans_400Regular, IBMPlexSans_700Bold });
                    send("FONT_INITIALIZATION_SUCCESS");
                } catch (error) {
                    logger.error("Failed to initialize fonts", error);
                    send("FONT_INITIALIZATION_FAILURE");
                }
            },
            initializeI18n: () => (send) => {
                const language = appStorage.getLanguage();
                initI18n(language);
                send("I18N_INITIALIZED");
            },
        },
    }
);

export default function App() {
    const [appState, appSend, appService] = useMachine(() => appMachine);
    const [authState] = useAuth();
    React.useEffect(() => {
        const subscription = appService.subscribe((state) => {
            logger.log("📱", state.value, state.event.type);
        });
        return () => subscription.unsubscribe();
    }, [appService]);

    useConfigureStatusBar();

    function onPostponeUpdate() {
        appSend({ type: "POSTPONE_UPDATE" });
    }

    if (appState.matches("loading")) {
        return <SplashScreen />;
    }

    if (appState.matches("selectingLanguage")) {
        return <LanguageSelectScreen onLanguageSelected={() => appSend({ type: "LANGUAGE_SELECTED" })} />;
    }

    if (appState.matches({ checkingAppVersion: "updateAvailable" })) {
        return <UpdateScreen mandatory={false} onPostpone={onPostponeUpdate} />;
    }

    if (appState.matches({ checkingAppVersion: "updateRequired" })) {
        return <UpdateScreen mandatory={true} onPostpone={onPostponeUpdate} />;
    }

    if (authState.matches("validatingPin")) {
        return <PinValidatorScreen />;
    }

    if (authState.matches("loggedOut")) {
        return <LoginScreen />;
    }

    if (authState.matches("loggedIn")) {
        return <AuthenticatedApp />;
    }

    return <SplashScreen />;
}

function AuthenticatedApp() {
    const profileQuery = useProfileQuery();
    const configQuery = useConfigQuery();
    const classifiersQuery = useClassifiersQuery();
    const featuresQuery = useFeaturesQuery();

    const isVmdAccountConnected = profileQuery.data?.vmdId !== undefined;

    const districtsQuery = useDistrictsQuery(isVmdAccountConnected);
    const contractsQuery = useContractsQuery(isVmdAccountConnected);
    const memberships = useMembershipsQuery(isVmdAccountConnected);
    const permitsQuery = usePermitsQuery(isVmdAccountConnected);
    const districtDamagesQuery = useDistrictDamagesQuery(isVmdAccountConnected);
    const huntsQuery = useHuntsQuery(isVmdAccountConnected);
    const infrastructureQuery = useInfrastructureQuery(isVmdAccountConnected);
    const huntedAnimalsQuery = useHuntedAnimalsQuery(isVmdAccountConnected);

    const species = useSpecies(classifiersQuery.data);

    const initialNavigationState = useInitialNavigationState();

    if (
        initialNavigationState.status !== "loaded" ||
        configQuery.isLoading ||
        classifiersQuery.isLoading ||
        featuresQuery.isLoading ||
        profileQuery.isLoading ||
        (isVmdAccountConnected
            ? contractsQuery.isLoading ||
              districtDamagesQuery.isLoading ||
              districtsQuery.isLoading ||
              memberships.isLoading ||
              permitsQuery.isLoading ||
              districtDamagesQuery.isLoading ||
              huntsQuery.isLoading
            : false)
    ) {
        return <InitialLoadingActiveScreen />;
    }

    if (
        configQuery.isLoadingError ||
        !configQuery.data ||
        classifiersQuery.isLoadingError ||
        !classifiersQuery.data ||
        featuresQuery.isLoadingError ||
        !featuresQuery.data ||
        profileQuery.isLoadingError ||
        !profileQuery.data ||
        (isVmdAccountConnected
            ? contractsQuery.isLoadingError ||
              !contractsQuery.data ||
              districtDamagesQuery.isLoadingError ||
              !districtDamagesQuery.data ||
              districtsQuery.isLoadingError ||
              !districtsQuery.data ||
              memberships.isLoadingError ||
              !memberships.data ||
              permitsQuery.isLoadingError ||
              !permitsQuery.data ||
              huntsQuery.isLoadingError ||
              !huntsQuery.data
            : false)
    ) {
        return (
            <InitialLoadingFailedScreen
                onRetry={() => {
                    if (configQuery.status === "error") {
                        configQuery.refetch();
                    }
                    if (profileQuery.status === "error") {
                        profileQuery.refetch();
                    }
                    if (classifiersQuery.status === "error") {
                        classifiersQuery.refetch();
                    }
                    if (featuresQuery.status === "error") {
                        featuresQuery.refetch();
                    }
                    if (districtsQuery.status === "error") {
                        districtsQuery.refetch();
                    }
                    if (contractsQuery.status === "error") {
                        contractsQuery.refetch();
                    }
                    if (districtDamagesQuery.status === "error") {
                        districtDamagesQuery.refetch();
                    }
                    if (memberships.status === "error") {
                        memberships.refetch();
                    }
                    if (permitsQuery.status === "error") {
                        permitsQuery.refetch();
                    }
                    if (huntsQuery.status === "error") {
                        huntsQuery.refetch();
                    }
                }}
            />
        );
    }

    return (
        <NewsProvider>
            <HuntActivitiesProvider>
                <ConfigContext.Provider value={configQuery.data}>
                    <ProfileContext.Provider value={profileQuery.data}>
                        <ClassifiersContext.Provider value={classifiersQuery.data}>
                            <FeaturesContext.Provider value={featuresQuery.data}>
                                <DistrictsContext.Provider value={districtsQuery.data ?? []}>
                                    <ContractsContext.Provider value={contractsQuery.data ?? []}>
                                        <MembershipsContext.Provider value={memberships.data ?? []}>
                                            <PermitsContext.Provider value={permitsQuery.data ?? []}>
                                                <DistrictDamagesContext.Provider
                                                    value={districtDamagesQuery.data ?? {}}
                                                >
                                                    <HuntsProvider hunts={huntsQuery.data ?? []}>
                                                        <SpeciesContext.Provider value={species}>
                                                            <InfrastructureProvider
                                                                queryData={infrastructureQuery.data}
                                                            >
                                                                <HuntedAnimalsContext.Provider
                                                                    value={huntedAnimalsQuery.data ?? []}
                                                                >
                                                                    <SelectedDistrictIdProvider>
                                                                        <MapSettingsProvider>
                                                                            <ReportsProvider>
                                                                                <NavigationContainer
                                                                                    initialState={
                                                                                        initialNavigationState.state
                                                                                    }
                                                                                >
                                                                                    <ConfirmationDialogProvider>
                                                                                        <RootNavigator />
                                                                                    </ConfirmationDialogProvider>
                                                                                </NavigationContainer>
                                                                            </ReportsProvider>
                                                                        </MapSettingsProvider>
                                                                    </SelectedDistrictIdProvider>
                                                                </HuntedAnimalsContext.Provider>
                                                            </InfrastructureProvider>
                                                        </SpeciesContext.Provider>
                                                    </HuntsProvider>
                                                </DistrictDamagesContext.Provider>
                                            </PermitsContext.Provider>
                                        </MembershipsContext.Provider>
                                    </ContractsContext.Provider>
                                </DistrictsContext.Provider>
                            </FeaturesContext.Provider>
                        </ClassifiersContext.Provider>
                    </ProfileContext.Provider>
                </ConfigContext.Provider>
            </HuntActivitiesProvider>
        </NewsProvider>
    );
}
