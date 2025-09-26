import * as React from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { FieldLabel } from "~/components/field-label";
import { Map, MapHandle } from "~/components/map/map";
import { Spacer } from "~/components/spacer";
import { configuration } from "~/configuration";
import { useDetailMapLayers } from "~/hooks/use-detail-map-layers";
import { theme } from "~/theme";

const { bounds, minZoom, maxZoom } = configuration.map;

type HuntLocationViewerProps = {
    latitude: number;
    longitude: number;
    huntType: "drivenHunt" | "individualHunt";
};

export function HuntLocationViewer(props: HuntLocationViewerProps) {
    const mapRef = React.useRef<MapHandle>(null);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [isMapOpen, setMapOpen] = React.useState(false);
    const [mapLoaded, setMapLoaded] = React.useState(false);

    const { layers, getActiveLayerIds } = useDetailMapLayers();

    function onMapModalOpen() {
        setMapOpen(() => true);
    }

    function onMapModalClose() {
        setMapOpen(() => false);
    }

    async function onLoad() {
        setMapLoaded(true);

        const position: GeoJSON.Position = [props.longitude, props.latitude];

        mapRef.current?.sendAction({
            type: "initialize",
            mode: "location",
            layers,
            activeLayerIds: getActiveLayerIds(),
            center: position,
            zoom: 16,
            bounds,
            minZoom,
            maxZoom,
            locationPinEnabled: true,
        });
    }

    React.useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        mapRef.current.sendAction({
            type: "setLocation",
            animated: false,
            center: { position: [props.longitude, props.latitude] },
            action: "update",
            follow: true,
        });
    }, [props.latitude, props.longitude]);

    // Update map layers when active layers change
    React.useEffect(() => {
        if (!mapLoaded) {
            return;
        }
        mapRef.current?.sendAction({
            type: "toggleLayer",
            activeLayers: getActiveLayerIds(),
        });
    }, [mapLoaded, getActiveLayerIds]);

    const isDrivenHunt = props.huntType === "drivenHunt";

    return (
        <View>
            <FieldLabel label={isDrivenHunt ? t("hunt.drivenHunt.meetingPlace") : t("hunt.individualHunt.huntPlace")} />
            <Spacer size={6} />
            <View style={styles.container}>
                <Map ref={mapRef} onLoad={onLoad} />
                <View style={[styles.mapOverlay, styles.dimmedOverlayCenter]}>
                    <Button
                        title={
                            isDrivenHunt ? t("hunt.drivenHunt.map.viewLocation") : t("hunt.individualHunt.viewLocation")
                        }
                        variant="primary"
                        onPress={onMapModalOpen}
                    />
                </View>
            </View>
            <Modal
                statusBarTranslucent
                visible={isMapOpen}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={onMapModalClose}
            >
                <View style={styles.containerModal}>
                    <View style={[styles.statusBar, { height: insets.top }]} />
                    <Map onLoad={onLoad} ref={mapRef} />
                    <View
                        style={[
                            styles.buttonContainer,
                            {
                                paddingBottom: insets.bottom + 16,
                                paddingLeft: insets.left + 16,
                                paddingRight: insets.right + 16,
                            },
                        ]}
                    >
                        <Button
                            title={t("hunt.drivenHunt.map.close")}
                            variant="primary"
                            onPress={onMapModalClose}
                            style={styles.button}
                        />
                    </View>
                </View>
            </Modal>
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
    mapOverlay: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
    },
    containerModal: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        backgroundColor: theme.color.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
        gap: 16,
    },
    button: {
        flex: 1,
    },
    dimmedOverlayCenter: {
        backgroundColor: theme.color.grayTransparent,
        justifyContent: "center",
        alignItems: "center",
    },
    statusBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        opacity: 0.8,
        backgroundColor: theme.color.green,
        zIndex: 1,
    },
});
