import { NavigationContainer } from "@react-navigation/native";
import { useMachine, useSelector } from "@xstate/react";
import * as React from "react";
import "react-native-gesture-handler";
import { MapSettingsProvider } from "~/hooks/use-map-settings";
import { SpeciesContext, useSpecies } from "~/hooks/use-species";
import { RootNavigator } from "~/navigation/root-navigator";
import { SplashScreen } from "~/screens/splash-screen";
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
import { ShapesProvider } from "./hooks/use-shapes";
import { useConfigureStatusBar } from "./hooks/use-status-bar";
import { UnlimitedHuntedAnimalsContext } from "./hooks/use-unlimited-hunted-animals";
import { useUnlimitedHuntedAnimalsQuery } from "./hooks/use-unlimited-hunted-animals-query";
import "./i18n";
import { logger } from "./logger";
import { appMachine } from "./machines/app-machine";
import { authenticationActor } from "./machines/authentication-machine";
import { InitialLoadingActiveScreen, InitialLoadingFailedScreen } from "./screens/initial-loading-screen";
import { LanguageSelectScreen } from "./screens/language-select-screen";
import { LoginScreen } from "./screens/login-screen";
import { PinValidatorScreen } from "./screens/pin/pin-validator-screen";
import { UpdateScreen } from "./screens/update-screen";

export default function App() {
    const [appState, appSend] = useMachine(appMachine, {
        inspect: (inspectEvent) => {
            if (inspectEvent.type === "@xstate.snapshot") {
                const snapshot = inspectEvent.actorRef?.getSnapshot();
                if (snapshot?.machine?.id === appMachine.id) {
                    logger.log("📱" + JSON.stringify(snapshot.value) + " " + inspectEvent.event.type);
                }
            }
        },
    });

    const authState = useSelector(authenticationActor, (state) => {
        if (state.matches("validatingPin")) {
            return "validatingPin";
        } else if (state.matches("loggedOut")) {
            return "loggedOut";
        } else if (state.matches("loggedIn")) {
            return "loggedIn";
        }
        return "other";
    });

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

    if (authState === "validatingPin") {
        return <PinValidatorScreen />;
    }

    if (authState === "loggedOut") {
        return <LoginScreen />;
    }

    if (authState === "loggedIn") {
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
    const unlimitedHuntedAnimalsQuery = useUnlimitedHuntedAnimalsQuery(isVmdAccountConnected);

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
            <ShapesProvider>
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
                                                                        <UnlimitedHuntedAnimalsContext.Provider
                                                                            value={
                                                                                unlimitedHuntedAnimalsQuery.data ?? []
                                                                            }
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
                                                                        </UnlimitedHuntedAnimalsContext.Provider>
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
            </ShapesProvider>
        </NewsProvider>
    );
}
