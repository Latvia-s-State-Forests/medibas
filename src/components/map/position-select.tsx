import { useActor } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Map, MapHandle } from "~/components/map/map";
import { configuration } from "~/configuration";
import { mapService } from "~/machines/map-machine";
import { theme } from "~/theme";
import { MapService } from "~/types/map";
import { Button } from "../button";
import { RoundIconButton } from "../round-icon-button";

type CurrentPositionIdleProps = {
    onMark: (position: GeoJSON.Position) => void;
    position: GeoJSON.Position | null;
};

export function PositionSelect({ onMark, position }: CurrentPositionIdleProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const embeddedMapRef = React.useRef<MapHandle>(null);
    const fullscreenMapRef = React.useRef<MapHandle>(null);
    const [layerState] = useActor(mapService);
    const [mapOpen, setMapOpen] = React.useState(false);
    const [mapOpenForEditing, setMapOpenForEditing] = React.useState(false);
    const [fullScreenMapLoaded, setFullScreenMapLoaded] = React.useState(false);
    const [embeddedMapLoaded, setEmbeddedMapLoaded] = React.useState(false);
    const { bounds, minZoom, maxZoom, services } = configuration.map;
    const layers = [services[0], services[1]];

    React.useEffect(() => {
        if (!embeddedMapLoaded) {
            return;
        }
        embeddedMapRef.current?.sendAction({
            type: "toggleLayer",
            activeLayers: layerState.context.activeLayerIds,
        });
    }, [embeddedMapLoaded, layerState.context.activeLayerIds]);

    React.useEffect(() => {
        if (!fullScreenMapLoaded) {
            return;
        }
        fullscreenMapRef.current?.sendAction({
            type: "toggleLayer",
            activeLayers: layerState.context.activeLayerIds,
        });
    }, [fullScreenMapLoaded, layerState.context.activeLayerIds]);

    React.useEffect(() => {
        if (!mapOpen && !mapOpenForEditing) {
            StatusBar.setBarStyle("light-content", true);
        } else {
            StatusBar.setBarStyle("dark-content", true);
        }
    }, [mapOpen, mapOpenForEditing]);

    async function onLoadEmbeddedMap() {
        setEmbeddedMapLoaded(true);

        const { activeLayerIds } = layerState.context;

        embeddedMapRef.current?.sendAction({
            type: "initialize",
            mode: "location",
            layers: layers as MapService[],
            activeLayerIds,
            center:
                position && !(position[0] === 0 && position[1] === 0)
                    ? position
                    : configuration.map.initialPosition.center,
            zoom: position && !(position[0] === 0 && position[1] === 0) ? 16 : configuration.map.initialPosition.zoom,
            bounds,
            minZoom,
            maxZoom,
            locationPinEnabled: !!position,
        });
    }
    async function onLoadFullScreenMap() {
        setFullScreenMapLoaded(true);

        const { activeLayerIds } = layerState.context;

        fullscreenMapRef.current?.sendAction({
            type: "initialize",
            mode: mapOpenForEditing ? "marker" : "location",
            layers: layers as MapService[],
            activeLayerIds,
            center:
                position && !(position[0] === 0 && position[1] === 0)
                    ? position
                    : configuration.map.initialPosition.center,
            zoom: position && !(position[0] === 0 && position[1] === 0) ? 16 : configuration.map.initialPosition.zoom,
            bounds,
            minZoom,
            maxZoom,
            mapMarker: true,
            locationPinEnabled: !!position && !mapOpenForEditing,
        });
    }

    function onModalClose() {
        setMapOpen(false);
        setMapOpenForEditing(false);
    }

    function onModalOpen() {
        setMapOpen(true);
    }

    function onModalOpenForEditing() {
        setMapOpenForEditing(() => true);
    }

    function onMarkerSelected(position: GeoJSON.Position) {
        onMark(position);
    }

    function onGetMarkerPosition() {
        fullscreenMapRef.current?.sendAction({
            type: "getMarkerPosition",
        });

        setTimeout(() => {
            onModalClose();
        }, 100);
    }

    return (
        <>
            <View style={styles.container}>
                {!mapOpen && !mapOpenForEditing ? <Map onLoad={onLoadEmbeddedMap} ref={embeddedMapRef} /> : null}
                {!position || (position[0] === 0 && position[1] === 0) ? (
                    <View style={[styles.mapOverlay, styles.dimmedOverlayCenter]}>
                        <Button
                            title={t("hunt.drivenHunt.map.chooseLocation")}
                            variant="primary"
                            onPress={onModalOpenForEditing}
                        />
                    </View>
                ) : (
                    <Pressable style={styles.mapOverlay} onPress={onModalOpen}>
                        <View style={styles.roundButtonContainer}>
                            <RoundIconButton onPress={onModalOpenForEditing} name="pin" elevation="high" />
                        </View>
                    </Pressable>
                )}
            </View>
            <Modal
                statusBarTranslucent
                visible={mapOpen || mapOpenForEditing}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={onModalClose}
            >
                <View style={styles.containerModal}>
                    <View style={[styles.statusBar, { height: insets.top }]} />
                    <Map onLoad={onLoadFullScreenMap} onMarkerSelected={onMarkerSelected} ref={fullscreenMapRef} />
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
                            title={mapOpenForEditing ? t("hunt.drivenHunt.map.cancel") : t("hunt.drivenHunt.map.close")}
                            variant="secondary-outlined"
                            onPress={onModalClose}
                            style={styles.button}
                        />
                        {mapOpenForEditing ? (
                            <Button
                                title={t("hunt.drivenHunt.map.choose")}
                                onPress={onGetMarkerPosition}
                                style={styles.button}
                            />
                        ) : null}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 200,
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
        backgroundColor: theme.color.background,
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
    roundButtonContainer: {
        position: "absolute",
        top: 12,
        right: 12,
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
