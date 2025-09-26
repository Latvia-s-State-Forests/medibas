import { assign, createActor, fromCallback, setup } from "xstate";
import { appStorage } from "~/app-storage";
import { configuration } from "~/configuration";
import { logger } from "~/logger";
import { MapServiceGroupSingle } from "~/types/map";

type MapMachineContext = {
    activeLayerIds: string[];
    center: GeoJSON.Position;
    zoom: number;
};

type MapMachineEvent =
    | { type: "DATA_LOADED"; activeLayerIds: string[]; center: GeoJSON.Position; zoom: number | undefined }
    | { type: "DATA_FAILED" }
    | { type: "TOGGLE_LAYER"; layerId: string }
    | { type: "VIEW_POSITION_CHANGED"; center: GeoJSON.Position; zoom: number | undefined };

const mapMachine = setup({
    types: {
        context: {} as MapMachineContext,
        events: {} as MapMachineEvent,
    },
    actions: {
        toggleLayer: assign({
            activeLayerIds: ({ context, event }) => {
                if (event.type !== "TOGGLE_LAYER") {
                    return context.activeLayerIds;
                }
                const serviceGroup = configuration.map.serviceGroups.find((serviceGroup) =>
                    serviceGroup.services.includes(event.layerId)
                );

                if (!serviceGroup) {
                    return context.activeLayerIds;
                }

                if (serviceGroup.selectionMode === "single") {
                    const layers = context.activeLayerIds
                        .filter((layerId) => !serviceGroup.services.includes(layerId))
                        .concat(event.layerId);
                    return layers;
                }

                if (serviceGroup.selectionMode === "multiple") {
                    if (context.activeLayerIds.includes(event.layerId)) {
                        const layers = context.activeLayerIds.filter(
                            (enabledLayerId) => enabledLayerId !== event.layerId
                        );
                        return layers;
                    }
                    const layers = context.activeLayerIds.concat(event.layerId);

                    return layers;
                }

                if (serviceGroup.selectionMode === "single-checkable") {
                    if (context.activeLayerIds.includes(event.layerId)) {
                        const layers = context.activeLayerIds.filter(
                            (enabledLayerId) => enabledLayerId !== event.layerId
                        );

                        return layers;
                    }

                    const layers = context.activeLayerIds
                        .filter(
                            (enabledLayerId) =>
                                !serviceGroup.services.some((service: string) => service === enabledLayerId)
                        )
                        .concat(event.layerId);

                    return layers;
                }

                logger.error("Unknown selection mode");
                return context.activeLayerIds;
            },
        }),
        setViewPosition: assign(({ context, event }) => {
            if (event.type !== "VIEW_POSITION_CHANGED") {
                return context;
            }

            return { ...context, center: event.center, zoom: event.zoom };
        }),
        assignStoredDataToContext: assign(({ context, event }) => {
            if (event.type !== "DATA_LOADED") {
                return context;
            }
            const updatedContext: MapMachineContext = {
                activeLayerIds: event.activeLayerIds,
                center: event.center,
                zoom: event.zoom || configuration.map.initialPosition.zoom,
            };
            return updatedContext;
        }),
        assignDefaultDataToContext: assign(({ context, event }) => {
            if (event.type !== "DATA_FAILED") {
                return context;
            }
            const center = configuration.map.initialPosition.center;
            const zoom = configuration.map.initialPosition.zoom;
            const activeLayerIds = [(configuration.map.serviceGroups[0] as MapServiceGroupSingle).defaultService];

            return {
                activeLayerIds,
                center,
                zoom,
            };
        }),
        saveActiveLayers: ({ context, event }) => {
            if (event.type !== "TOGGLE_LAYER") {
                return;
            }
            appStorage.setMapActiveLayerIds(context.activeLayerIds);
        },
        saveViewPosition: ({ event }) => {
            if (event.type !== "VIEW_POSITION_CHANGED" || !event.zoom) {
                return;
            }

            appStorage.setMapPosition({ center: event.center, zoom: event.zoom });
        },
    },
    actors: {
        loadStoredData: fromCallback(({ sendBack }: { sendBack: (event: MapMachineEvent) => void }) => {
            try {
                const storedLayerIds = appStorage.getMapActiveLayerIds();
                const storedPosition = appStorage.getMapPosition();

                const activeLayerIds = storedLayerIds?.length
                    ? storedLayerIds
                    : [(configuration.map.serviceGroups[0] as MapServiceGroupSingle).defaultService];
                const center = storedPosition?.center || configuration.map.initialPosition.center;
                const zoom = storedPosition?.zoom || configuration.map.initialPosition.zoom;

                sendBack({
                    type: "DATA_LOADED",
                    activeLayerIds,
                    center,
                    zoom,
                });
            } catch (error) {
                logger.error("Failed to load stored data", error);
                sendBack({ type: "DATA_FAILED" });
            }
        }),
    },
}).createMachine({
    id: "mapMachine",
    context: { activeLayerIds: [], center: [], zoom: 0 },
    initial: "loading",
    states: {
        loading: {
            invoke: {
                src: "loadStoredData",
            },
            on: {
                DATA_LOADED: {
                    target: "ready",
                    actions: "assignStoredDataToContext",
                },
                DATA_FAILED: {
                    target: "ready",
                    actions: ["assignDefaultDataToContext", "saveActiveLayers", "saveViewPosition"],
                },
            },
        },
        ready: {
            on: {
                TOGGLE_LAYER: {
                    actions: ["toggleLayer", "saveActiveLayers"],
                },
                VIEW_POSITION_CHANGED: {
                    actions: ["setViewPosition", "saveViewPosition"],
                },
            },
        },
    },
});

export const mapActor = createActor(mapMachine);
