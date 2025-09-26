import { useSelector } from "@xstate/react";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Map, MapHandle } from "~/components/map/map";
import { configuration } from "~/configuration";
import { useDistricts } from "~/hooks/use-districts";
import { mapActor } from "~/machines/map-machine";
import { theme } from "~/theme";
import { initializeMap as initializeMinimap } from "~/utils/initialize-minimap";

type DistrictDamagePositionProps = {
    latitude: number;
    longitude: number;
};

export function DistrictDamagePosition(props: DistrictDamagePositionProps) {
    const mapRef = React.useRef<MapHandle>(null);
    const districts = useDistricts();
    const layerContext = useSelector(mapActor, (state) => state.context);

    const layers = React.useMemo(() => {
        return configuration.map.services.map((service) => {
            if (service.id === "districts") {
                return { ...service, features: districts };
            } else {
                return service;
            }
        });
    }, [districts]);

    const getActiveLayerIds = React.useCallback(() => {
        const baseMapServiceIds = new Set<string>();
        for (const serviceGroup of configuration.map.serviceGroups) {
            if (serviceGroup.isBasemapServiceGroup) {
                for (const serviceId of serviceGroup.services) {
                    baseMapServiceIds.add(serviceId);
                }
            }
        }

        const activeBaseMaps = layerContext.activeLayerIds.filter((id) => baseMapServiceIds.has(id));

        return [...activeBaseMaps, "districts"];
    }, [layerContext.activeLayerIds]);

    async function onLoad() {
        await initializeMinimap(mapRef, props.latitude, props.longitude, layers, getActiveLayerIds());
    }

    return (
        <View style={styles.container}>
            <Map ref={mapRef} onLoad={onLoad} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        overflow: "hidden",
        backgroundColor: theme.color.gray1,
        position: "relative",
    },
});
