import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Map, MapHandle } from "~/components/map/map";
import { configuration } from "~/configuration";
import { theme } from "~/theme";

type DistrictDamagePositionProps = {
    latitude: number;
    longitude: number;
};

export function DistrictDamagePosition(props: DistrictDamagePositionProps) {
    const mapRef = React.useRef<MapHandle>(null);

    async function onLoad() {
        const { bounds, minZoom, maxZoom, services } = configuration.map;

        const layers = services.filter((service) => service.id === "lvm-forest-map");

        mapRef.current?.sendAction({
            type: "initialize",
            mode: "location",
            layers,
            activeLayerIds: ["lvm-forest-map"],
            center: [props.longitude, props.latitude],
            zoom: 16,
            bounds,
            minZoom,
            maxZoom,
            locationPinEnabled: true,
        });
        mapRef.current?.sendAction({
            type: "setLocation",
            action: "update",
            center: { position: [props.longitude, props.latitude] },
            follow: true,
            animated: false,
        });
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
