import { useActor, useInterpret, useSelector } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Map, MapHandle } from "~/components/map/map";
import { configuration } from "~/configuration";
import { useConfig } from "~/hooks/use-config";
import { fetchPositionMachine } from "~/machines/fetch-position-machine";
import { mapService } from "~/machines/map-machine";
import { theme } from "~/theme";
import { MapService } from "~/types/map";
import { Button } from "../button";
import { Dialog } from "../dialog";
import { RoundIconButton } from "../round-icon-button";
import { Spinner } from "../spinner";

const MARKER_ZOOM = 16;

type CurrentPositionIdleProps = {
    onMark: (position: GeoJSON.Position) => void;
    position: GeoJSON.Position | null;
    positionType: "individualHunt" | "drivenHunt" | "infrastructure";
};

export function PositionSelect({ onMark, position, positionType }: CurrentPositionIdleProps) {
    const { t } = useTranslation();
    const config = useConfig();
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

    const [mapViewPosition, setMapViewPosition] = React.useState<
        { center: GeoJSON.Position; zoom?: number } | undefined
    >(undefined);

    const fetchPositionActor = useInterpret(() => fetchPositionMachine, {
        context: { config },
        actions: {
            onPositionSuccess: (context, event) => {
                if (event.type === "POSITION_SUCCESS") {
                    let zoom: number;
                    if (mapViewPosition?.zoom && mapViewPosition.zoom >= MARKER_ZOOM) {
                        zoom = mapViewPosition.zoom;
                    } else {
                        zoom = MARKER_ZOOM;
                    }
                    fullscreenMapRef.current?.sendAction({
                        type: "setPosition",
                        center: [event.position.longitude, event.position.latitude],
                        zoom,
                        animated: true,
                    });
                }
            },
        },
    });

    const [dialog, setDialog] = React.useState<{ visible: boolean; type: "loading" | "failure" }>({
        visible: false,
        type: "loading",
    });

    React.useEffect(() => {
        const subscription = fetchPositionActor.subscribe((state) => {
            if (state.matches("idle")) {
                setDialog((dialog) => ({ ...dialog, visible: false }));
            } else if (state.matches("fetchingPosition")) {
                setDialog({ visible: true, type: "loading" });
            } else if (state.matches("failure")) {
                setDialog({ visible: true, type: "failure" });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchPositionActor]);

    const isFetchPositionActive = useSelector(fetchPositionActor, (state) => state.matches("fetchingPosition"));

    function onFetchPositionButtonPress() {
        fetchPositionActor.send({ type: "FETCH" });
    }

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
            zoom:
                position && !(position[0] === 0 && position[1] === 0)
                    ? MARKER_ZOOM
                    : configuration.map.initialPosition.zoom,
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
            zoom:
                position && !(position[0] === 0 && position[1] === 0)
                    ? MARKER_ZOOM
                    : configuration.map.initialPosition.zoom,
            bounds,
            minZoom,
            maxZoom,
            locationPinEnabled: !!position && !mapOpenForEditing,
        });
    }

    function onModalClose() {
        setMapOpen(false);
        setMapOpenForEditing(false);

        fetchPositionActor.send({ type: "CANCEL" });
    }

    function onModalOpen() {
        setMapOpen(true);
    }

    function onModalOpenForEditing() {
        setMapOpenForEditing(() => true);
    }

    function onSubmitButtonPress() {
        if (mapViewPosition) {
            onMark(mapViewPosition.center);
            onModalClose();
        }
    }

    function onMapViewPositionChanged(center: GeoJSON.Position, zoom?: number) {
        setMapViewPosition({ center, zoom });
    }

    function getLocationButtonText(): string {
        switch (positionType) {
            case "drivenHunt":
                return t("hunt.drivenHunt.map.chooseLocation");
            case "infrastructure":
                return t("mtl.infrastructure.addLocation");
            case "individualHunt":
            default:
                return t("hunt.individualHunt.map.chooseLocation");
        }
    }

    return (
        <>
            <View style={styles.container}>
                {!mapOpen && !mapOpenForEditing ? <Map onLoad={onLoadEmbeddedMap} ref={embeddedMapRef} /> : null}
                {!position || (position[0] === 0 && position[1] === 0) ? (
                    <View style={[styles.mapOverlay, styles.dimmedOverlayCenter]}>
                        <Button title={getLocationButtonText()} variant="primary" onPress={onModalOpenForEditing} />
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
                    <Map
                        onLoad={onLoadFullScreenMap}
                        ref={fullscreenMapRef}
                        onViewPositionChanged={onMapViewPositionChanged}
                    />
                    {positionType === "infrastructure" && mapOpenForEditing ? (
                        <View
                            style={[
                                styles.locationTrackingButton,
                                { marginTop: insets.top + 16, marginRight: insets.right + 16 },
                            ]}
                        >
                            <RoundIconButton
                                elevation="high"
                                onPress={onFetchPositionButtonPress}
                                appearance={isFetchPositionActive ? "active" : "default"}
                                name="target"
                            />
                        </View>
                    ) : null}
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
                                onPress={onSubmitButtonPress}
                                style={styles.button}
                            />
                        ) : null}
                    </View>
                </View>
                <Dialog
                    visible={dialog.visible}
                    icon={dialog.type === "failure" ? "failure" : <Spinner />}
                    title={dialog.type === "failure" ? t("map.position.failure.title") : t("currentPosition.loading")}
                    description={dialog.type === "failure" ? t("map.position.failure.message") : undefined}
                    onBackButtonPress={() =>
                        fetchPositionActor.send({ type: dialog.type === "failure" ? "RESET" : "CANCEL" })
                    }
                    buttons={
                        <Button
                            title={dialog.type === "failure" ? t("modal.close") : t("modal.cancel")}
                            onPress={() =>
                                fetchPositionActor.send({ type: dialog.type === "failure" ? "RESET" : "CANCEL" })
                            }
                        />
                    }
                />
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
    locationTrackingButton: {
        position: "absolute",
        top: 0,
        right: 0,
        flexDirection: "row",
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
