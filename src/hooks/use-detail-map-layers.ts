import { useSelector } from "@xstate/react";
import * as React from "react";
import { configuration } from "~/configuration";
import { useDistricts } from "~/hooks/use-districts";
import { mapActor } from "~/machines/map-machine";

const { services, serviceGroups } = configuration.map;

export function useDetailMapLayers() {
    const districts = useDistricts();
    const layerContext = useSelector(mapActor, (state) => state.context);

    const { baseMapIds, layers } = React.useMemo(() => {
        const baseMapGroup = serviceGroups.find((group) => group.isBasemapServiceGroup);
        const baseMapIds = baseMapGroup?.services || [];

        const allowedIds = [...baseMapIds, "districts"];

        const layers = services
            .filter((service) => allowedIds.includes(service.id))
            .map((service) => {
                if (service.id === "districts") {
                    return { ...service, features: districts };
                }
                return service;
            });

        return { baseMapIds, layers };
    }, [districts]);

    const getActiveLayerIds = React.useCallback(() => {
        const activeBaseMaps = layerContext.activeLayerIds.filter((id) => baseMapIds.includes(id));

        // Always include districts regardless of main map state
        return [...activeBaseMaps, "districts"];
    }, [layerContext.activeLayerIds, baseMapIds]);

    return { baseMapIds, layers, getActiveLayerIds };
}
