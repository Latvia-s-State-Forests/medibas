import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useMachine, useSelector } from "@xstate/react";
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
import { DrawToolbar } from "~/components/draw-toolbar";
import { FeatureListItem } from "~/components/feature-list-item";
import { useInfrastructureFeatures } from "~/components/infrastructure-provider";
import { Map, MapHandle } from "~/components/map/map";
import { RoundIconButton } from "~/components/round-icon-button";
import SelectedFeatureDetail from "~/components/selected-feature-detail";
import { SettingsButton } from "~/components/settings-button";
import { SquareIconButton } from "~/components/square-icon-button";
import { configuration } from "~/configuration";
import { useAllDistrictDamages } from "~/hooks/use-district-damages";
import { useDistricts } from "~/hooks/use-districts";
import { useFeatures } from "~/hooks/use-features";
import { useAllHuntedAnimals } from "~/hooks/use-hunted-animals";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { useAllUnlimitedHuntedAnimals } from "~/hooks/use-unlimited-hunted-animals";
import { logger } from "~/logger";
import { mapActor } from "~/machines/map-machine";
import { trackPositionMachine } from "~/machines/track-position-machine";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { SpeciesId } from "~/types/classifiers";
import { DistrictDamage } from "~/types/district-damages";
import { Feature } from "~/types/features";
import { SelectedFeature } from "~/types/hunt-map";
import { HuntedAnimal } from "~/types/hunted-animals";
import { Infrastructure } from "~/types/infrastructure";
import { MapService, MapServiceCustomWithFeatures } from "~/types/map";
import { UnlimitedHuntedAnimal } from "~/types/unlimited-hunted-animals";
import { useLineDrawing } from "../../hooks/use-line-drawing";
import { usePolygonDrawing } from "../../hooks/use-polygon-drawing";
import { SaveDrawnShapeModal } from "./save-drawn-shape-modal";

const JITTER_THRESHOLD = 2;

type SelectedFeatureData = {
    damages: Array<Feature & { featureType: "damages" }>;
    observations: Array<Feature & { featureType: "observations" }>;
    "district-damages": Array<DistrictDamage & { featureType: "district-damages" }>;
    "district-hunted-others": Array<HuntedAnimal & { featureType: "district-hunted-others" }>;
    "district-hunted-red-deer": Array<HuntedAnimal & { featureType: "district-hunted-red-deer" }>;
    "district-hunted-moose": Array<HuntedAnimal & { featureType: "district-hunted-moose" }>;
    "district-hunted-roe-deer": Array<HuntedAnimal & { featureType: "district-hunted-roe-deer" }>;
    "district-hunted-boar": Array<HuntedAnimal & { featureType: "district-hunted-boar" }>;
    "district-infrastructures": Array<Infrastructure & { featureType: "district-infrastructures" }>;
    "district-hunted-others-unlimited": Array<
        UnlimitedHuntedAnimal & { featureType: "district-hunted-others-unlimited" }
    >;
};

export function MapScreen() {
    const infrastructures = useInfrastructureFeatures();
    const huntedAnimals = useAllHuntedAnimals();
    const unlimitedHuntedAnimals = useAllUnlimitedHuntedAnimals();
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
    const lineDrawing = useLineDrawing(mapRef);
    const polygonDrawing = usePolygonDrawing(mapRef);
    const [drawType, setDrawType] = React.useState<"line" | "polygon">("line");
    const [shapeDrawn, setShapeDrawn] = React.useState(false);
    const [hasMultiplePoints, setHasMultiplePoints] = React.useState(false);
    const [hasFirstPoint, setHasFirstPoint] = React.useState(false);
    const [isSaveShapeModalVisible, setSaveShapeModalVisible] = React.useState(false);
    const [shapeName, setShapeName] = React.useState<string>("");
    const [showAdditionalTools, setShowAdditionalTools] = React.useState(false);
    const onLineDraw = React.useCallback(() => {
        // Clear any active polygon drawing before starting line drawing
        polygonDrawing.deletePolygon();
        setHasFirstPoint(false);
        setDrawType("line");
        setShapeDrawn(false);
        setHasMultiplePoints(false);
        lineDrawing.startLineDraw();
    }, [lineDrawing, polygonDrawing]);

    const onPolygonDraw = React.useCallback(() => {
        // Clear any active line drawing before starting polygon drawing
        lineDrawing.deleteLine();
        setHasFirstPoint(false);
        setDrawType("polygon");
        setShapeDrawn(false);
        setHasMultiplePoints(false);
        polygonDrawing.startPolygonDraw();
    }, [lineDrawing, polygonDrawing]);

    const onDeleteLine = React.useCallback(() => {
        lineDrawing.deleteLine();
        setHasFirstPoint(false);
        setShapeDrawn(false);
    }, [lineDrawing]);

    const onDeletePolygon = React.useCallback(() => {
        polygonDrawing.deletePolygon();
        setShapeDrawn(false);
        setHasFirstPoint(false);
    }, [polygonDrawing]);

    const onFinishDrawing = React.useCallback(() => {
        mapRef.current?.sendAction({
            type: "finishCurrentDrawing",
        });
        setHasMultiplePoints(false);
    }, []);

    const onDrawingCleared = React.useCallback(() => {
        setShapeDrawn(false);
    }, []);

    const onShapeDrawn = React.useCallback(
        (coordinates: number[][], shapeId: string, type: "line" | "polygon") => {
            if (type === "line") {
                lineDrawing.onLineDrawn(coordinates, shapeId);
            } else {
                polygonDrawing.onPolygonDrawn(coordinates, shapeId);
            }
            setShapeDrawn(true);
            setHasMultiplePoints(false);
        },
        [lineDrawing, polygonDrawing]
    );

    const onShapeModified = React.useCallback(
        (coordinates: number[][], shapeId: string, type: "line" | "polygon") => {
            if (type === "line") {
                lineDrawing.onLineModified(coordinates, shapeId);
            } else {
                polygonDrawing.onPolygonModified(coordinates, shapeId);
            }
            setShapeDrawn(true);
        },
        [lineDrawing, polygonDrawing]
    );

    const saveShape = React.useCallback(
        (shapeName: string) => {
            if (drawType === "line") {
                lineDrawing.saveLine(shapeName);
            } else {
                polygonDrawing.savePolygon(shapeName);
            }
            setShapeDrawn(false);
        },
        [drawType, lineDrawing, polygonDrawing]
    );

    const selectedFeaturesData = selectedFeaturesCluster.reduce(
        (acc, feature, index) => {
            if (feature.layer === "district-infrastructures") {
                const f = infrastructures.data.find((feat) => feat.id === feature.id);
                if (f) {
                    acc["district-infrastructures"].push({ ...f, featureType: "district-infrastructures" });
                }
            }
            if (feature.layer === "district-hunted-others") {
                const f = huntedAnimals.data.find((feat) => feat.huntReportId === feature.id);
                if (f) {
                    acc["district-hunted-others"].push({ ...f, featureType: "district-hunted-others" });
                }
            }
            if (feature.layer === "district-hunted-red-deer") {
                const f = huntedAnimals.data.find((feat) => feat.huntReportId === feature.id);
                if (f) {
                    acc["district-hunted-red-deer"].push({ ...f, featureType: "district-hunted-red-deer" });
                }
            }
            if (feature.layer === "district-hunted-moose") {
                const f = huntedAnimals.data.find((feat) => feat.huntReportId === feature.id);
                if (f) {
                    acc["district-hunted-moose"].push({ ...f, featureType: "district-hunted-moose" });
                }
            }
            if (feature.layer === "district-hunted-roe-deer") {
                const f = huntedAnimals.data.find((feat) => feat.huntReportId === feature.id);
                if (f) {
                    acc["district-hunted-roe-deer"].push({ ...f, featureType: "district-hunted-roe-deer" });
                }
            }
            if (
                feature.layer === "district-hunted-others-unlimited" &&
                unlimitedHuntedAnimals.data.some((feat) => feat.huntReportId === feature.id)
            ) {
                const f = unlimitedHuntedAnimals.data.find((feat) => feat.huntReportId === feature.id);
                if (f) {
                    acc["district-hunted-others-unlimited"].push({
                        ...f,
                        featureType: "district-hunted-others-unlimited",
                    });
                }
            }
            if (feature.layer === "district-hunted-boar") {
                const f = huntedAnimals.data.find((feat) => feat.huntReportId === feature.id);
                if (f) {
                    acc["district-hunted-boar"].push({ ...f, featureType: "district-hunted-boar" });
                }
            }
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
                acc["district-infrastructures"].sort(districtInfrastructuresSort);
            }
            return acc;
        },
        {
            damages: [],
            observations: [],
            "district-damages": [],
            "district-infrastructures": [],
            "district-hunted-others": [],
            "district-hunted-red-deer": [],
            "district-hunted-moose": [],
            "district-hunted-roe-deer": [],
            "district-hunted-boar": [],
            "district-hunted-others-unlimited": [],
        } as SelectedFeatureData
    );

    function selectedFeatureData() {
        if (!selectedFeature) {
            return;
        }
        return selectedFeaturesData[selectedFeature?.layer as keyof typeof selectedFeaturesData].find((feat) => {
            if (selectedFeature?.layer === "district-damages") {
                return (feat as DistrictDamage).id === selectedFeature?.id;
            } else if (selectedFeature?.layer === "district-infrastructures") {
                return (feat as Infrastructure).id === selectedFeature?.id;
            } else if (selectedFeature?.layer === "district-hunted-others") {
                return (feat as HuntedAnimal).huntReportId === selectedFeature?.id;
            } else if (selectedFeature?.layer === "district-hunted-red-deer") {
                return (feat as HuntedAnimal).huntReportId === selectedFeature?.id;
            } else if (selectedFeature?.layer === "district-hunted-moose") {
                return (feat as HuntedAnimal).huntReportId === selectedFeature?.id;
            } else if (selectedFeature?.layer === "district-hunted-roe-deer") {
                return (feat as HuntedAnimal).huntReportId === selectedFeature?.id;
            } else if (selectedFeature?.layer === "district-hunted-boar") {
                return (feat as HuntedAnimal).huntReportId === selectedFeature?.id;
            } else if (selectedFeature?.layer === "district-hunted-others-unlimited") {
                return (feat as UnlimitedHuntedAnimal).huntReportId === selectedFeature?.id;
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
                .with("district-infrastructures", () => t("mtl.infrastructure.districtInfrastructure"))
                .with("district-hunted-others", () => t("map.bottomSheet.subtitle.districtHuntedAnimals"))
                .with("district-hunted-red-deer", () => t("map.bottomSheet.subtitle.districtHuntedAnimals"))
                .with("district-hunted-moose", () => t("map.bottomSheet.subtitle.districtHuntedAnimals"))
                .with("district-hunted-roe-deer", () => t("map.bottomSheet.subtitle.districtHuntedAnimals"))
                .with("district-hunted-others-unlimited", () => t("map.bottomSheet.subtitle.districtHuntedAnimals"))
                .with("district-hunted-boar", () => t("map.bottomSheet.subtitle.districtHuntedAnimals"))
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

    const layerContext = useSelector(mapActor, (state) => state.context);
    const [trackingState, trackingSend] = useMachine(
        trackPositionMachine.provide({
            actions: {
                setPositionOnMap: ({ context }) => {
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
                restorePositionOnMap: ({ context }) => {
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
        })
    );

    const [mapLoaded, setMapLoaded] = React.useState(false);

    // Whenever the screen is focused, refetch districts
    useFocusEffect(
        React.useCallback(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.districts });
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
            activeDistrictIds: selectedDistrictId ? [selectedDistrictId] : [],
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

            if (service.id === "district-hunted-others") {
                acc.push({
                    ...service,
                    features: huntedAnimals.features.filter((animal) =>
                        [SpeciesId.Wolf, SpeciesId.WesternCapercaillie, SpeciesId.BlackGrouse].includes(
                            animal.properties.speciesId
                        )
                    ),
                });
            }
            if (service.id === "district-hunted-red-deer") {
                acc.push({
                    ...service,
                    features: huntedAnimals.features.filter(
                        (animal) => animal.properties.speciesId === SpeciesId.RedDeer
                    ),
                });
            }

            if (service.id === "district-hunted-moose") {
                acc.push({
                    ...service,
                    features: huntedAnimals.features.filter(
                        (animal) => animal.properties.speciesId === SpeciesId.Moose
                    ),
                });
            }

            if (service.id === "district-hunted-roe-deer") {
                acc.push({
                    ...service,
                    features: huntedAnimals.features.filter(
                        (animal) => animal.properties.speciesId === SpeciesId.RoeDeer
                    ),
                });
            }

            if (service.id === "district-hunted-boar") {
                acc.push({
                    ...service,
                    features: huntedAnimals.features.filter(
                        (animal) => animal.properties.speciesId === SpeciesId.WildBoar
                    ),
                });
            }

            if (service.id === "district-hunted-others-unlimited") {
                acc.push({
                    ...service,
                    features: unlimitedHuntedAnimals.features,
                });
            }

            if (service.id === "district-infrastructures") {
                acc.push({ ...service, features: infrastructures.features });
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
    }, [
        features,
        districtDamages,
        selectedDistrictId,
        mapLoaded,
        selectedFeaturesCluster.length,
        infrastructures,
        huntedAnimals,
        unlimitedHuntedAnimals,
    ]);

    // Create a stable reference to the restore function
    const restoreVisibleLinesRef = React.useRef(lineDrawing.restoreVisibleLines);
    const restoreVisiblePolygonsRef = React.useRef(polygonDrawing.restoreVisiblePolygons);

    // Update the ref when the function changes
    React.useEffect(() => {
        restoreVisibleLinesRef.current = lineDrawing.restoreVisibleLines;
    }, [lineDrawing.restoreVisibleLines]);

    React.useEffect(() => {
        restoreVisiblePolygonsRef.current = polygonDrawing.restoreVisiblePolygons;
    }, [polygonDrawing.restoreVisiblePolygons]);

    React.useEffect(() => {
        if (!mapLoaded) {
            return;
        }
        mapRef.current?.sendAction({
            type: "toggleLayer",
            activeLayers: layerContext.activeLayerIds,
        });

        // Restore shapes after layer toggle (and on initial load)
        setTimeout(() => {
            restoreVisibleLinesRef.current();
            restoreVisiblePolygonsRef.current();
        }, 300);
    }, [layerContext.activeLayerIds, mapLoaded]);

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

        if (center === layerContext.center && zoom === layerContext.zoom) {
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
        mapActor.send({ type: "VIEW_POSITION_CHANGED", center, zoom });
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
        lineDrawing.onMapLoaded();
        polygonDrawing.onMapLoaded();
        const { bounds, minZoom, maxZoom, services } = configuration.map;

        const layers = (services as MapService[]).map((service) => {
            if (service.id === "districts") {
                return { ...service, features: districts };
            } else if (service.id === "district-damages") {
                return { ...service, features: districtDamages.features };
            } else if (service.id === "district-hunted-others") {
                return { ...service, features: huntedAnimals.features };
            } else if (service.id === "district-hunted-red-deer") {
                return { ...service, features: huntedAnimals.features };
            } else if (service.id === "district-hunted-moose") {
                return { ...service, features: huntedAnimals.features };
            } else if (service.id === "district-hunted-roe-deer") {
                return { ...service, features: huntedAnimals.features };
            } else if (service.id === "district-hunted-others-unlimited") {
                return { ...service, features: unlimitedHuntedAnimals.features };
            } else if (service.id === "district-hunted-boar") {
                return { ...service, features: huntedAnimals.features };
            } else if (service.id === "district-infrastructures") {
                return { ...service, features: infrastructures.features };
            } else if (service.type === "Custom") {
                return { ...service, features: features[service.id as keyof typeof features] };
            } else {
                return service;
            }
        });

        const { activeLayerIds, center, zoom } = layerContext;

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
        if (selectedFeatures.length === 1) {
            const layer = selectedFeatures[0].layer;
            const id = selectedFeatures[0].id;
            setSelectedFeature(() => {
                return { id, layer };
            });

            if (layer === "district-infrastructures") {
                const f = infrastructures.features.find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("district-infrastructures feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "district-infrastructures" },
                });
            } else if (layer === "district-hunted-others") {
                const f = huntedAnimals.features.find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("Selected hunted animal feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "district-hunted-others" },
                });
            } else if (layer === "district-hunted-red-deer") {
                const f = huntedAnimals.features.find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("Selected hunted red deer feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "district-hunted-red-deer" },
                });
            } else if (layer === "district-hunted-moose") {
                const f = huntedAnimals.features.find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("Selected hunted moose feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "district-hunted-moose" },
                });
            } else if (layer === "district-hunted-roe-deer") {
                const f = huntedAnimals.features.find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("Selected hunted roe deer feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "district-hunted-roe-deer" },
                });
            } else if (layer === "district-hunted-others-unlimited") {
                const f = unlimitedHuntedAnimals.features.find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("Selected unlimited hunted animal feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "district-hunted-others-unlimited" },
                });
            } else if (layer === "district-hunted-boar") {
                const f = huntedAnimals.features.find((f) => f.properties.id === id);
                if (!f) {
                    logger.error("Selected hunted boar feature not found", { layer, id });
                    return;
                }
                mapRef.current?.sendAction({
                    type: "selectIndividualFeature",
                    feature: { ...f, featureType: layer as "district-hunted-boar" },
                });
            } else if (layer !== "district-damages") {
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
                const f = districtDamages.features.find((f) => f.properties.id === id);
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
            | (Infrastructure & { featureType: "district-infrastructures" })
            | (HuntedAnimal & { featureType: "district-hunted-others" })
            | (HuntedAnimal & { featureType: "district-hunted-red-deer" })
            | (HuntedAnimal & { featureType: "district-hunted-moose" })
            | (HuntedAnimal & { featureType: "district-hunted-roe-deer" })
            | (UnlimitedHuntedAnimal & { featureType: "district-hunted-others-unlimited" })
            | (HuntedAnimal & { featureType: "district-hunted-boar" })
    ) {
        if (feature.featureType === "district-damages") {
            const f = districtDamages.features.find((feat) => feat.properties.id === feature.id);
            if (!f) {
                logger.error("Selected feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-damages" },
            });
            setSelectedFeature({ id: feature.id, layer: "district-damages" });
        } else if (feature.featureType === "district-hunted-others") {
            const f = huntedAnimals.features.find((feat) => feat.properties.id === feature.huntReportId);
            if (!f) {
                logger.error("Selected hunted animal feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-hunted-others" },
            });
            setSelectedFeature({ id: feature.huntReportId, layer: "district-hunted-others" });
        } else if (feature.featureType === "district-hunted-red-deer") {
            const f = huntedAnimals.features.find((feat) => feat.properties.id === feature.huntReportId);
            if (!f) {
                logger.error("Selected hunted red deer feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-hunted-red-deer" },
            });
            setSelectedFeature({ id: feature.huntReportId, layer: "district-hunted-red-deer" });
        } else if (feature.featureType === "district-hunted-moose") {
            const f = huntedAnimals.features.find((feat) => feat.properties.id === feature.huntReportId);
            if (!f) {
                logger.error("Selected hunted moose feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-hunted-moose" },
            });
            setSelectedFeature({ id: feature.huntReportId, layer: "district-hunted-moose" });
        } else if (feature.featureType === "district-hunted-roe-deer") {
            const f = huntedAnimals.features.find((feat) => feat.properties.id === feature.huntReportId);
            if (!f) {
                logger.error("Selected hunted roe deer feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-hunted-roe-deer" },
            });
            setSelectedFeature({ id: feature.huntReportId, layer: "district-hunted-roe-deer" });
        } else if (feature.featureType === "district-hunted-boar") {
            const f = huntedAnimals.features.find((feat) => feat.properties.id === feature.huntReportId);
            if (!f) {
                logger.error("Selected hunted boar feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-hunted-boar" },
            });
            setSelectedFeature({ id: feature.huntReportId, layer: "district-hunted-boar" });
        } else if (feature.featureType === "district-hunted-others-unlimited") {
            const f = unlimitedHuntedAnimals.features.find((feat) => feat.properties.id === feature.huntReportId);
            if (!f) {
                logger.error("Selected unlimited hunted animal feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-hunted-others-unlimited" },
            });
            setSelectedFeature({ id: feature.huntReportId, layer: "district-hunted-others-unlimited" });
        } else if (feature.featureType === "district-infrastructures") {
            const f = infrastructures.features.find((feat) => feat.properties.id === feature.id);
            if (!f) {
                logger.error("district-infrastructures feature not found", { feature });
                return;
            }
            mapRef.current?.sendAction({
                type: "selectIndividualFeature",
                feature: { ...f, featureType: "district-infrastructures" },
            });
            setSelectedFeature({ id: feature.id, layer: "district-infrastructures" });
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
                        onLineDrawn={(coords, id) => onShapeDrawn(coords, id, "line")}
                        onPolygonDrawn={(coords, id) => onShapeDrawn(coords, id, "polygon")}
                        onPolygonModified={(coords, id) => onShapeModified(coords, id, "polygon")}
                        onLineModified={(coords, id) => onShapeModified(coords, id, "line")}
                        onDrawingCleared={onDrawingCleared}
                        onMultiplePoints={(hasMultiplePoints) => {
                            setHasMultiplePoints(hasMultiplePoints);
                        }}
                        onFirstPoint={(hasFirstPoint) => {
                            setHasFirstPoint(hasFirstPoint);
                        }}
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
                    <View style={styles.drawingButton}>
                        <DrawToolbar
                            onDeletePolygon={onDeletePolygon}
                            onDeleteLine={onDeleteLine}
                            shapeDrawn={shapeDrawn}
                            onLineDraw={onLineDraw}
                            onPolygonDraw={onPolygonDraw}
                            onSave={() => setSaveShapeModalVisible(true)}
                            showAdditionalTools={showAdditionalTools}
                            setShowAdditionalTools={setShowAdditionalTools}
                            hasMultiplePoints={hasMultiplePoints}
                            hasFirstPoint={hasFirstPoint}
                            onFinishDrawing={onFinishDrawing}
                        />
                    </View>
                    <View style={styles.layerButton}>
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
                                        <FeatureListItem
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

                            {selectedFeaturesData["district-hunted-red-deer"].length ? (
                                <Collapsible
                                    title={t("map.settings.layers.huntedAnimals.redDeer")}
                                    badgeCount={selectedFeaturesData["district-hunted-red-deer"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-hunted-red-deer"]?.map((feature) => (
                                        <FeatureListItem
                                            feature={{ ...feature, featureType: "district-hunted-red-deer" }}
                                            key={feature.huntReportId}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-hunted-red-deer",
                                                })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}

                            {selectedFeaturesData["district-hunted-moose"].length ? (
                                <Collapsible
                                    title={t("map.settings.layers.huntedAnimals.moose")}
                                    badgeCount={selectedFeaturesData["district-hunted-moose"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-hunted-moose"]?.map((feature) => (
                                        <FeatureListItem
                                            feature={{ ...feature, featureType: "district-hunted-moose" }}
                                            key={feature.huntReportId}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-hunted-moose",
                                                })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}
                            {selectedFeaturesData["district-hunted-roe-deer"].length ? (
                                <Collapsible
                                    title={t("map.settings.layers.huntedAnimals.roeDeer")}
                                    badgeCount={selectedFeaturesData["district-hunted-roe-deer"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-hunted-roe-deer"]?.map((feature) => (
                                        <FeatureListItem
                                            feature={{ ...feature, featureType: "district-hunted-roe-deer" }}
                                            key={feature.huntReportId}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-hunted-roe-deer",
                                                })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}
                            {selectedFeaturesData["district-hunted-others-unlimited"].length ? (
                                <Collapsible
                                    title={t("map.settings.layers.huntedAnimals.unlimited")}
                                    badgeCount={selectedFeaturesData["district-hunted-others-unlimited"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-hunted-others-unlimited"]?.map((feature) => (
                                        <FeatureListItem
                                            feature={{ ...feature, featureType: "district-hunted-others-unlimited" }}
                                            key={feature.huntReportId}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-hunted-others-unlimited",
                                                })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}
                            {selectedFeaturesData["district-hunted-boar"].length ? (
                                <Collapsible
                                    title={t("map.settings.layers.huntedAnimals.wildBoar")}
                                    badgeCount={selectedFeaturesData["district-hunted-boar"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-hunted-boar"]?.map((feature) => (
                                        <FeatureListItem
                                            feature={{ ...feature, featureType: "district-hunted-boar" }}
                                            key={feature.huntReportId}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-hunted-boar",
                                                })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}

                            {selectedFeaturesData["district-hunted-others"].length ? (
                                <Collapsible
                                    title={t("map.settings.layers.huntedAnimals.others")}
                                    badgeCount={selectedFeaturesData["district-hunted-others"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-hunted-others"]?.map((feature) => (
                                        <FeatureListItem
                                            feature={{ ...feature, featureType: "district-hunted-others" }}
                                            key={feature.huntReportId}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-hunted-others",
                                                })
                                            }
                                        />
                                    ))}
                                </Collapsible>
                            ) : null}

                            {selectedFeaturesData["district-infrastructures"].length ? (
                                <Collapsible
                                    title={t("mtl.infrastructure.inDistricts")}
                                    badgeCount={selectedFeaturesData["district-infrastructures"].length}
                                    defaultCollapsed={false}
                                    style={styles.listSpacing}
                                >
                                    {selectedFeaturesData["district-infrastructures"]?.map((feature) => (
                                        <FeatureListItem
                                            feature={{ ...feature, featureType: "district-infrastructures" }}
                                            key={feature.guid}
                                            onPress={() =>
                                                onSelectIndividualFeature({
                                                    ...feature,
                                                    featureType: "district-infrastructures",
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
                                        <FeatureListItem
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
                                        <FeatureListItem
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
            <SaveDrawnShapeModal
                visible={isSaveShapeModalVisible}
                value={shapeName}
                onChangeText={setShapeName}
                onConfirm={() => {
                    saveShape(shapeName);
                    setSaveShapeModalVisible(false);
                    setShapeName("");
                    setShowAdditionalTools(false);
                }}
                onReject={() => {
                    setSaveShapeModalVisible(false);
                    setShapeName("");
                }}
            />
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
    drawingButton: {
        position: "absolute",
        bottom: 16,
        left: 16,
    },
    layerButton: {
        position: "absolute",
        bottom: 16,
        left: 76,
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

function districtInfrastructuresSort(a: Infrastructure, b: Infrastructure) {
    return new Date(b.createdOnDevice).getTime() - new Date(a.createdOnDevice).getTime();
}
