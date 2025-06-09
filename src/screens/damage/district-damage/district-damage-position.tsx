import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Map, MapHandle } from "~/components/map/map";
import { theme } from "~/theme";
import { initializeMap as initializeMinimap } from "~/utils/initialize-minimap";

type DistrictDamagePositionProps = {
    latitude: number;
    longitude: number;
};

export function DistrictDamagePosition(props: DistrictDamagePositionProps) {
    const mapRef = React.useRef<MapHandle>(null);

    async function onLoad() {
        await initializeMinimap(mapRef, props.latitude, props.longitude);
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
