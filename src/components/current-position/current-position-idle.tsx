import { useActor } from "@xstate/react";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Map, MapHandle } from "~/components/map/map";
import { RoundIconButton } from "~/components/round-icon-button";
import { configuration } from "~/configuration";
import { useAllDistrictDamages } from "~/hooks/use-district-damages";
import { useDistricts } from "~/hooks/use-districts";
import { useFeatures } from "~/hooks/use-features";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { mapService } from "~/machines/map-machine";
import { theme } from "~/theme";
import { MapService } from "~/types/map";
import { PositionResult } from "~/types/position-result";

type CurrentPositionIdleProps = {
    position: PositionResult;
    onRetry: () => void;
};

export function CurrentPositionIdle({ onRetry, position }: CurrentPositionIdleProps) {
    const mapRef = React.useRef<MapHandle>(null);
    const [layerState] = useActor(mapService);
    const features = useFeatures();
    const districts = useDistricts();
    const [selectedDistrictId] = useSelectedDistrictId();
    const districtDamages = useAllDistrictDamages();
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const district = React.useMemo(
        () => districts.find((district) => district.id === selectedDistrictId),
        [districts, selectedDistrictId]
    );

    React.useEffect(() => {
        if (!mapLoaded) {
            return;
        }
        mapRef.current?.sendAction({
            type: "setDistricts",
            districts,
            activeDistrictId: selectedDistrictId,
        });
    }, [mapLoaded, districts, selectedDistrictId]);

    React.useEffect(() => {
        if (!mapLoaded) {
            return;
        }
        mapRef.current?.sendAction({
            type: "toggleLayer",
            activeLayers: layerState.context.activeLayerIds,
        });
    }, [layerState.context.activeLayerIds, mapLoaded]);

    React.useEffect(() => {
        if (!mapLoaded) {
            return;
        }
        mapRef.current?.sendAction({
            type: "setLocation",
            action: "update",
            center: { position: [position.longitude, position.latitude] },
            follow: true,
            animated: false,
        });
    }, [mapLoaded, position.latitude, position.longitude]);

    async function onLoad() {
        setMapLoaded(true);
        const { bounds, minZoom, maxZoom, services } = configuration.map;

        const layers = (services as MapService[]).map((service) => {
            if (service.id === "districts") {
                return { ...service, features: districts };
            } else if (service.id === "district-damages") {
                return { ...service, features: districtDamages.features };
            } else if (service.type === "Custom") {
                return { ...service, features: features[service.id as keyof typeof features] };
            } else {
                return service;
            }
        });
        const { activeLayerIds } = layerState.context;

        mapRef.current?.sendAction({
            type: "initialize",
            mode: "location",
            layers: layers as MapService[],
            activeLayerIds,
            activeDistrict: district?.id,
            center: [position.longitude, position.latitude],
            zoom: 16,
            bounds,
            minZoom,
            maxZoom,
            locationPinEnabled: true,
        });
    }

    return (
        <View style={style.container}>
            <Map onLoad={onLoad} ref={mapRef} />
            <View style={style.buttonContainer}>
                <RoundIconButton onPress={onRetry} name="pin" elevation="high" />
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        minHeight: 200,
        backgroundColor: theme.color.gray1,
        position: "relative",
    },
    buttonContainer: {
        position: "absolute",
        top: 12,
        right: 12,
    },
});
