import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useActor, useMachine } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInLeft, FadeOutLeft, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { BottomSheet } from "~/components/bottom-sheet";
import { Button } from "~/components/button";
import { Collapsible } from "~/components/collapsible/collapsible";
import { Dialog } from "~/components/dialog";
import { DistrictDamageFeatureListItem } from "~/components/feature-list-item";
import { Map, MapHandle } from "~/components/map/map";
import { RoundIconButton } from "~/components/round-icon-button";
import SelectedFeatureDetail from "~/components/selected-feature-detail";
import { SettingsButton } from "~/components/settings-button";
import { SquareIconButton } from "~/components/square-icon-button";
import { configuration } from "~/configuration";
import { useAllDistrictDamages } from "~/hooks/use-district-damages";
import { useDistricts } from "~/hooks/use-districts";
import { useFeatures } from "~/hooks/use-features";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { logger } from "~/logger";
import { mapService } from "~/machines/map-machine";
import { trackPositionMachine } from "~/machines/track-position-machine";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { DistrictDamage } from "~/types/district-damages";
import { Feature } from "~/types/features";
import { SelectedFeature } from "~/types/hunt-map";
import { MapService, MapServiceCustomWithFeatures } from "~/types/map";

const JITTER_THRESHOLD = 2;

type SelectedFeatureData = {
    damages: Array<Feature & { featureType: "damages" }>;
    observations: Array<Feature & { featureType: "observations" }>;
    "district-damages": Array<DistrictDamage & { featureType: "district-damages" }>;
};

export function MapScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const mapRef = React.useRef<MapHandle>(null);
    const features = useFeatures();
    const districts = useDistricts();
    const [selectedDistrictId] = useSelectedDistrictId();
    const districtDamages = useAllDistrictDamages();
    const [selectedFeaturesCluster, setSelectedFeaturesCluster] = React.useState<SelectedFeature[]>([]);
    const [selectedFeature, setSelectedFeature] = React.useState<SelectedFeature | null>(null);
    const selectedFeaturesData = selectedFeaturesCluster.reduce(
        (acc, feature, index) => {
            if (feature.layer === "observations") {
                const f = features[feature.layer].find((feat) => feat.properties.id === feature.id);
                if (f) {
                    acc[feature.layer].push({ ...f, featureType: feature.layer });
                }
            }
            if (feature.layer === "damages") {
                const f = features[feature.layer].find((feat) => feat.properties.id === feature.id);
                if (f) {
                    acc[feature.layer].push({ ...f, featureType: feature.layer });
                }
            }

            if (feature.layer === "district-damages") {
                const f = districtDamages.data.find((feat) => feat.id === feature.id);
                if (f) {
                    acc["district-damages"].push({ ...f, featureType: "district-damages" });
                }
            }

            if (selectedFeaturesCluster.length === index + 1) {
                acc.damages.sort(featureSort);
                acc.observations.sort(featureSort);
                acc["district-damages"].sort(districtDamageSort);
            }
            return acc;
        },
        { damages: [], observations: [], "district-damages": [] } as SelectedFeatureData
    );

    function selectedFeatureData() {
        if (!selectedFeature) {
            return;
        }
        return selectedFeaturesData[selectedFeature?.layer as keyof typeof selectedFeaturesData].find((feat) => {
            if (selectedFeature?.layer === "district-damages") {
                return (feat as DistrictDamage).id === selectedFeature?.id;
            } else {
                return (feat as Feature).properties.id === selectedFeature?.id;
            }
        });
    }

    function bottomSheetTitle(): string {
        const selected = selectedFeatureData();
        if (selected) {
            return match(selected.featureType)
                .with("damages", () => t("map.bottomSheet.subtitle.damages"))
                .with("district-damages", () => t("map.bottomSheet.subtitle.district-damages"))
                .with("observations", () => t("map.bottomSheet.subtitle.observations"))
                .exhaustive();
        }
        return t("map.bottomSheet.title");
    }
    const district = React.useMemo(
        () => districts.find((district) => district.id === selectedDistrictId),
        [districts, selectedDistrictId]
    );

    React.useEffect(() => {
        if (selectedFeaturesCluster.length) {
            return;
        }
        const { services } = configuration.map;
        const newFeatures = services.reduce((acc, service) => {
            service = service as MapServiceCustomWithFeatures;
            if (service.id === "observations" || service.id === "damages") {
                acc.push({
                    ...service,
                    features: features[service.id as keyof typeof features],
                });
            }
            if (service.id === "district-damages") {
                acc.push({ ...service, features: districtDamages.features });
            }
            return acc;
        }, [] as MapServiceCustomWithFeatures[]);

        if (newFeatures.every((feature) => feature.features.length === 0)) {
            return;
        }

        mapRef.current?.sendAction({
            type: "setFeatures",
            features: newFeatures,
        });
    }, [features, districtDamages, selectedDistrictId, selectedFeaturesCluster.length]);

    const [layerState, layerSend] = useActor(mapService);
    const [trackingState, trackingSend] = useMachine(() => trackPositionMachine, {
        actions: {
            setPositionOnMap: (context) => {
                if (!context.location) {
                    return;
                }
                mapRef.current?.sendAction({
                    type: "setLocation",
                    action: "update",
                    center: { position: context.location, accuracy: context.accuracy },
                    follow: trackingState.matches({ tracking: { mode: "active" } }),
                    animated: true,
                });
            },
            removePositionFromMap: () => {
                mapRef.current?.sendAction({
                    type: "setLocation",
                    action: "disable",
                });
            },
            restorePositionOnMap: (context) => {
                if (!context.location) {
                    return;
                }

                mapRef.current?.sendAction({
                    type: "setLocation",
                    action: "update",
                    center: { position: context.location, accuracy: context.accuracy },
                    follow: true,
                    animated: true,
                });
            },
        },
    });

    const [mapLoaded, setMapLoaded] = React.useState(false);

    // Whenever the screen is focused, refetch districts
    useFocusEffect(
        React.useCallback(() => {
            queryClient.invalidateQueries(queryKeys.districts);
        }, [])
    );

    React.useEffect(() => {
        const unsubscribe = navigation.addListener("blur", () => {
            trackingSend({ type: "SCREEN_BLUR" });
        });

        return () => {
            unsubscribe();
        };
    }, [navigation, trackingSend]);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            trackingSend({ type: "SCREEN_FOCUS" });
        });

        return () => {
            unsubscribe();
        };
    }, [navigation, trackingSend]);

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
        if (!mapLoaded || selectedFeaturesCluster.length) {
            return;
        }
        const { services } = configuration.map;
        const newFeatures = services.reduce((acc, service) => {
            service = service as MapServiceCustomWithFeatures;
            if (service.id === "observations" || service.id === "damages") {
                acc.push({
                    ...service,
                    features: features[service.id as keyof typeof features],
                });
            }
            if (service.id === "district-damages") {
                acc.push({ ...service, features: districtDamages.features });
            }
            return acc;
        }, [] as MapServiceCustomWithFeatures[]);

        if (newFeatures.every((feature) => feature.features.length === 0)) {
            return;
        }

        mapRef.current?.sendAction({
            type: "setFeatures",
            features: newFeatures,
        });
    }, [features, districtDamages, selectedDistrictId, mapLoaded, selectedFeaturesCluster.length]);

    React.useEffect(() => {
        if (!mapLoaded) {
            return;
        }
        mapRef.current?.sendAction({
            type: "toggleLayer",
            activeLayers: layerState.context.activeLayerIds,
        });
    }, [layerState.context.activeLayerIds, mapLoaded]);

    function onToggleLocation() {
        onDeselectFeatures();
        trackingSend({ type: "TOGGLE" });
    }

    function onMapDragged() {
        trackingSend({ type: "MAP_DRAGGED" });
    }

    function trackingButtonStatus() {
        if (trackingState.matches({ tracking: { mode: "active" } })) {
            return "active";
        }
        if (trackingState.matches({ tracking: { mode: "background" } })) {
            return "background";
        }
        return "default";
    }

    function handleReturnHome() {
        onDeselectFeatures();
        const {
            initialPosition: { center, zoom },
        } = configuration.map;
        trackingSend({
            type: "MAP_DRAGGED",
        });

        if (center === layerState.context.center && zoom === layerState.context.zoom) {
            return;
        }

        mapRef.current?.sendAction({
            type: "setPosition",
            center,
            zoom,
            animated: true,
        });
    }

    function onViewPositionChanged(center: GeoJSON.Position, zoom: number | undefined) {
        layerSend({ type: "VIEW_POSITION_CHANGED", center, zoom });
    }

    function smoothHeading(rawHeading: number, prevHeading: number | undefined, alpha: number = 0.3): number {
        // If no previous heading, use raw heading as initial value
        if (prevHeading === undefined) {
            return rawHeading;
        }

        // Handle the case when heading crosses 0/360 boundary
        let diff = rawHeading - prevHeading;

        if (diff > 180) {
            diff -= 360;
        } else if (diff < -180) {
            diff += 360;
        }

        // Ignore small fluctuations
        if (Math.abs(diff) <= JITTER_THRESHOLD) {
            return prevHeading;
        }

        // Apply low pass filter
        let newHeading = prevHeading + alpha * diff;

        // Normalize to 0-360 range
        if (newHeading >= 360) {
            newHeading -= 360;
        } else if (newHeading < 0) {
            newHeading += 360;
        }

        return Math.round(newHeading);
    }

    function getHeadingSteps(
        targetHeading: number,
        currentHeading: number,
        stepCount: number = 10,
        threshold: number = 4
    ): number[] {
        const from = ((currentHeading % 360) + 360) % 360;
        const to = ((targetHeading % 360) + 360) % 360;

        // If small difference, return target directly
        if (Math.abs(to - from) <= threshold) {
            return [to];
        }

        // Calculate clockwise distance (going from current to target clockwise)
        const clockwise = to >= from ? to - from : 360 - from + to;

        // Calculate counterclockwise distance (going from current to target counterclockwise)
        const counterclockwise = from >= to ? from - to : 360 - to + from;

        const step =
            clockwise <= counterclockwise
                ? clockwise / stepCount // clockwise (positive)
                : -counterclockwise / stepCount; // counterclockwise (negative)

        const steps = [];
        for (let i = 0; i <= stepCount; i++) {
            let heading = from + step * i;
            heading = ((heading % 360) + 360) % 360;
            steps.push(heading);
        }

        return steps;
    }

    const previousHeading = React.useRef(0);
    const smoothedHeading = smoothHeading(trackingState.context.heading ?? 0, previousHeading.current);
    const headingSteps = getHeadingSteps(smoothedHeading, previousHeading.current);

    React.useEffect(() => {
        for (const heading of headingSteps) {
            mapRef.current?.sendAction({ type: "setHeading", heading });
        }

        previousHeading.current = smoothedHeading;
    }, [smoothedHeading, headingSteps]);

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

        const { activeLayerIds, center, zoom } = layerState.context;

        mapRef.current?.sendAction({
            type: "initialize",
            mode: "user",
            layers: layers as MapService[],
            activeLayerIds,
            activeDistrict: district?.id,
            center,
            zoom,
            bounds,
            minZoom,
            maxZoom,
        });
    }

    function onSelectClusterFeature(selectedFeatures: SelectedFeature[]) {
        setSelectedFeaturesCluster(() => selectedFeatures);
        if (selectedFeatures.length == 1) {
            const layer = selectedFeatures[0].layer;
            const id = selectedFeatures[0].id;
            setSelectedFeature(() => {
                return { id, layer };
            });
            if (layer !== "district-damages") {
                const f = (features[layer as keyof typeof features] as Feature[]).find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("Selected feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "damages" | "observations" | "district-damages" },
                });
            } else {
                const f = districtDamages.features.find((f) => f.properties.featureId === id);
                if (!f) {
                    logger.error("Selected feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: "district-damages" },
                });
            }
        }
        if (!selectedFeatures.length || selectedFeatures.length > 1) {
            setSelectedFeature(null);
        }
    }

    function onSelectIndividualFeature(
        feature:
            | (Feature & { featureType: "damages" | "observations" })
            | (DistrictDamage & { featureType: "district-damages" })
    ) {
        if (feature.featureType === "district-damages") {
            const f = districtDamages.features.find((feat) => feat.properties.featureId === feature.id);
            if (!f) {
                logger.error("Selected feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-damages" },
            });
            setSelectedFeature({ id: feature.id, layer: "district-damages" });
        } else {
            mapRef.current?.sendAction({ type: "selectIndividualFeature", feature });
            setSelectedFeature({ id: feature.properties.id, layer: feature.featureType });
        }
    }

    function onDeselectFeatures() {
        setSelectedFeaturesCluster([]);
        setSelectedFeature(null);
        mapRef.current?.sendAction({ type: "deselectFeatures" });
    }

    function onNavigateMenu() {
        onDeselectFeatures();
    }

    function onHeaderBackButtonPress() {
        setSelectedFeature(null);
        mapRef.current?.sendAction({ type: "showFeatures" });
    }

    return (
        <View style={styles.screen}>
            <Animated.View style={styles.container} layout={Layout}>
                <View style={styles.contentContainer}>
                    <View style={[styles.statusBar, { height: insets.top }]} />
                    <Map
                        ref={mapRef}
                        onLoad={onLoad}
                        onMapDragged={onMapDragged}
                        onViewPositionChanged={onViewPositionChanged}
                        onFeaturesSelected={onSelectClusterFeature}
                    />
                    <View style={[styles.leftContainer, { marginTop: insets.top + 16, marginLeft: insets.left + 16 }]}>
                        <SettingsButton onPress={onNavigateMenu} />
                    </View>
                    <View
                        style={[styles.rightContainer, { marginTop: insets.top + 16, marginRight: insets.right + 16 }]}
                    >
                        <RoundIconButton
                            elevation="high"
                            onPress={handleReturnHome}
                            appearance="default"
                            name="house"
                        />
                        <RoundIconButton
                            elevation="high"
                            onPress={onToggleLocation}
                            appearance={trackingButtonStatus()}
                            name="target"
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <SquareIconButton onPress={() => navigation.navigate("MapSettingsModal")} name="mapLayers" />
                    </View>
                </View>
                <BottomSheet
                    visible={!!selectedFeaturesCluster.length}
                    title={bottomSheetTitle()}
                    onClose={onDeselectFeatures}
                    showBackButton={!!selectedFeature}
                    onBackButtonPress={onHeaderBackButtonPress}
                >
                    {selectedFeature ? (
                        <SelectedFeatureDetail selectedFeatureData={selectedFeatureData()} />
                    ) : (
                        <Animated.ScrollView
                            contentContainerStyle={styles.sheetContent}
                            entering={FadeInLeft}
                            exiting={FadeOutLeft}
                        >
                            {selectedFeaturesData["district-damages"].length ? (
                                <Collapsible
                                    title={t("map.settings.layers.districtDamages")}
                                    badgeCount={selectedFeaturesData["district-damages"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-damages"]?.map((feature) => (
                                        <DistrictDamageFeatureListItem
                                            feature={{ ...feature, featureType: "district-damages" }}
                                            key={feature.id}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-damages",
                                                })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}

                            {selectedFeaturesData.damages.length ? (
                                <Collapsible
                                    title={t("map.settings.layers.damages")}
                                    defaultCollapsed={false}
                                    badgeCount={selectedFeaturesData.damages.length}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData.damages?.map((feature) => (
                                        <DistrictDamageFeatureListItem
                                            feature={{ ...feature, featureType: "damages" }}
                                            key={feature.properties.id}
                                            onPress={() =>
                                                onSelectIndividualFeature({ ...feature, featureType: "damages" })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}
                            {selectedFeaturesData.observations.length ? (
                                <Collapsible
                                    title={t("map.settings.layers.observations")}
                                    badgeCount={selectedFeaturesData.observations.length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData.observations?.map((feature) => (
                                        <DistrictDamageFeatureListItem
                                            feature={{ ...feature, featureType: "observations" }}
                                            key={feature.properties.id}
                                            onPress={() =>
                                                onSelectIndividualFeature({ ...feature, featureType: "observations" })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}
                        </Animated.ScrollView>
                    )}
                </BottomSheet>
            </Animated.View>

            <Dialog
                visible={trackingState.matches("error")}
                icon="failure"
                title={t("map.position.failure.title")}
                description={t("map.position.failure.message")}
                onBackButtonPress={() => trackingSend({ type: "RESET" })}
                buttons={<Button title={t("modal.close")} onPress={() => trackingSend({ type: "RESET" })} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        position: "relative",
    },
    container: {
        flex: 1,
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
    contentContainer: {
        flex: 1,
        position: "relative",
    },
    leftContainer: {
        top: 0,
        left: 0,
        position: "absolute",
    },

    rightContainer: {
        position: "absolute",
        top: 0,
        right: 0,
        flexDirection: "row",
    },
    bottomContainer: {
        position: "absolute",
        bottom: 16,
        left: 16,
    },
    sheetContent: {
        paddingHorizontal: 16,
        gap: 10,
    },
    listSpacing: {
        gap: 10,
    },
});

function featureSort(a: Feature, b: Feature) {
    return new Date(b.properties.reportCreatedOn).getTime() - new Date(a.properties.reportCreatedOn).getTime();
}

function districtDamageSort(a: DistrictDamage, b: DistrictDamage) {
    return new Date(b.vmdAcceptedOn).getTime() - new Date(a.vmdAcceptedOn).getTime();
}
