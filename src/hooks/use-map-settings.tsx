import * as React from "react";
import { match } from "ts-pattern";
import { configuration } from "~/configuration";

interface MapSettings {
    visibleServiceIds: string[];
}

interface MapSettingsLoadingState {
    status: "loading";
}

interface MapSettingsLoadedState {
    status: "loaded";
    settings: MapSettings;
}

type MapSettingsState = MapSettingsLoadingState | MapSettingsLoadedState;

interface MapSettingsLoadingSuccessAction {
    type: "loadingSuccess";
    settings: MapSettings;
}

interface MapSettingsToggleServiceAction {
    type: "toggleService";
    serviceGroupId: string;
    serviceId: string;
}

type MapSettingsAction = MapSettingsLoadingSuccessAction | MapSettingsToggleServiceAction;

type MapSettingsDispatch = (action: MapSettingsAction) => void;

const MapSettingsContext = React.createContext<{
    state: MapSettingsState;
    dispatch: MapSettingsDispatch;
} | null>(null);

function reducer(state: MapSettingsState, action: MapSettingsAction): MapSettingsState {
    return match<{ state: MapSettingsState; action: MapSettingsAction }, MapSettingsState>({ state, action })
        .with({ state: { status: "loading" }, action: { type: "loadingSuccess" } }, ({ action }) => {
            const newState: MapSettingsState = { status: "loaded", settings: action.settings };
            return newState;
        })
        .with({ state: { status: "loaded" }, action: { type: "toggleService" } }, ({ state, action }) => {
            const { serviceGroupId, serviceId } = action;
            const serviceGroup = configuration.map.serviceGroups.find(
                (serviceGroup) => serviceGroup.id === serviceGroupId
            );

            if (!serviceGroup?.services.includes(serviceId)) {
                return state;
            }

            const visibleServiceIds: string[] = match(serviceGroup.selectionMode)
                .with("single", () => {
                    const result = state.settings.visibleServiceIds.filter(
                        (visibleServiceId) => !serviceGroup.services.includes(visibleServiceId)
                    );
                    result.push(action.serviceId);
                    return result;
                })
                .with("single-checkable", () => {
                    const result = state.settings.visibleServiceIds.filter(
                        (visibleServiceId) => !serviceGroup.services.includes(visibleServiceId)
                    );

                    if (!state.settings.visibleServiceIds.includes(serviceId)) {
                        result.push(serviceId);
                    }

                    return result;
                })
                .with("multiple", () => {
                    if (state.settings.visibleServiceIds.includes(serviceId)) {
                        return state.settings.visibleServiceIds.filter(
                            (visibleServiceId) => visibleServiceId !== serviceId
                        );
                    }

                    return [...state.settings.visibleServiceIds, serviceId];
                })
                .exhaustive();

            const newState: MapSettingsState = { ...state, settings: { ...state.settings, visibleServiceIds } };
            return newState;
        })
        .otherwise(() => state);
}

interface MapSettingsProviderProps {
    children: React.ReactNode;
}

export function MapSettingsProvider(props: MapSettingsProviderProps) {
    const [state, dispatch] = React.useReducer(reducer, { status: "loading" });

    // TODO remove when real implementation has been added
    React.useEffect(() => {
        const settings = getDefaultMapSettings();
        dispatch({ type: "loadingSuccess", settings });
    }, []);

    // Restore saved map settings
    // React.useEffect(() => {
    //     if (state.status === "loading") {
    //         Storage.get({ key: StorageKey.MapSettings })
    //             .then((result) => {
    //                 if (result.value) {
    //                     return JSON.parse(result.value) as MapSettings;
    //                 }
    //                 return getDefaultMapSettings();
    //             })
    //             .then((settings) => {
    //                 dispatch({ type: "loadingSuccess", settings });
    //             });
    //     }
    // }, [state]);

    // Save map settings when changed
    // React.useEffect(() => {
    //     if (state.status === "loaded") {
    //         Storage.set({ key: StorageKey.MapSettings, value: JSON.stringify(state.settings) });
    //     }
    // }, [state]);

    const value = { state, dispatch };

    return <MapSettingsContext.Provider value={value}>{props.children}</MapSettingsContext.Provider>;
}

export function useMapSettingsContext() {
    const context = React.useContext(MapSettingsContext);

    if (context === null) {
        throw new Error("MapSettingsContext not initialized");
    }

    return context;
}

function getDefaultMapServiceIds() {
    const defaultServiceIds: string[] = [];

    for (const serviceGroup of configuration.map.serviceGroups) {
        if (serviceGroup.selectionMode === "single") {
            defaultServiceIds.push(serviceGroup.defaultService);
        }

        if (serviceGroup.selectionMode === "single-checkable" && serviceGroup.defaultService) {
            defaultServiceIds.push(serviceGroup.defaultService);
        }

        if (serviceGroup.selectionMode === "multiple" && serviceGroup.defaultServices) {
            defaultServiceIds.push(...serviceGroup.defaultServices);
        }
    }

    return defaultServiceIds;
}

function getDefaultMapSettings(): MapSettings {
    const visibleServiceIds = getDefaultMapServiceIds();
    return {
        visibleServiceIds,
    };
}
