import { useNavigation } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, LayoutChangeEvent, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Collapsible } from "~/components/collapsible/collapsible";
import { Dialog } from "~/components/dialog";
import { Header } from "~/components/header";
import { IconButton } from "~/components/icon-button";
import { ImageButton } from "~/components/image-button";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { Switch } from "~/components/switch";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useDistricts } from "~/hooks/use-districts";
import { usePermissions } from "~/hooks/use-permissions";
import { getAppLanguage } from "~/i18n";
import { mapActor } from "~/machines/map-machine";
import { useSavedShapes } from "../../hooks/use-saved-shapes";

function getColumnCount(containerWidth: number, itemWidth: number, gap: number): number {
    let columnCount = Math.floor(containerWidth / itemWidth);
    let columnGap = (columnCount - 1) * gap;

    while (itemWidth * columnCount + columnGap > containerWidth) {
        columnCount = columnCount - 1;
        columnGap = (columnCount - 1) * gap;
    }

    return columnCount;
}

function getRowCount(itemCount: number, columnCount: number): number {
    return Math.ceil(itemCount / columnCount);
}

export function MapSettingsModal() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const layerContext = useSelector(mapActor, (state) => state.context);
    const [width, setWidth] = React.useState(Dimensions.get("window").width);
    const permissions = usePermissions();
    const districts = useDistricts();
    const classifiers = useClassifiers();
    const language = getAppLanguage();
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const {
        lines,
        polygons,
        visibleLines,
        visiblePolygons,
        lineToDelete,
        polygonToDelete,
        setLineToDelete,
        setPolygonToDelete,
        toggleLineVisibility,
        zoomToShape,
        togglePolygonVisibility,
        deleteLine,
        deletePolygon,
    } = useSavedShapes();

    function handleLayerChange(layerId: string) {
        mapActor.send({ type: "TOGGLE_LAYER", layerId });
    }

    function onDeleteSavedLine(lineId: string | null) {
        deleteLine(lineId);
        setShowDeleteDialog(false);
        setLineToDelete(null);
    }

    function onDeleteSavedPolygon(polygonId: string | null) {
        deletePolygon(polygonId);
        setShowDeleteDialog(false);
        setPolygonToDelete(null);
    }
    const layerGroups = configuration.map.serviceGroups.map(({ id, services, title }) => {
        const groupServices = configuration.map.services
            .filter((service) => {
                // Hide districts service when districts are not available
                if (service.id === "districts" && (districts.length === 0 || !permissions.viewDistrictOnMap)) {
                    return false;
                }
                // Hide district damages service when user is not a member of a district
                if (service.id === "district-damages" && !permissions.viewDistrictDamages) {
                    return false;
                }

                if (service.id === "district-infrastructures" && !permissions.viewInfrastructuresLayer) {
                    return false;
                }

                const huntedAnimalServices = [
                    "district-hunted-others",
                    "district-hunted-moose",
                    "district-hunted-red-deer",
                    "district-hunted-roe-deer",
                    "district-hunted-boar",
                    "district-hunted-others-unlimited",
                ];

                if (huntedAnimalServices.includes(service.id) && !permissions.viewHuntedAnimalsOnMap) {
                    return false;
                }

                return services.includes(service.id);
            })
            .map(({ id: serviceId, thumbnail }) => {
                const serviceClassifier = classifiers.mapServices?.options.find((option) => option.code === serviceId);

                let serviceTitle;
                if (serviceClassifier?.description && language && serviceClassifier.description[language]) {
                    serviceTitle = serviceClassifier.description[language];
                } else {
                    serviceTitle = "-";
                }

                return {
                    id: serviceId,
                    thumbnail,
                    title: serviceTitle,
                };
            });

        return { id, title, services: groupServices };
    });

    const columnCount = getColumnCount(width - 32, 72, 16);
    const groups: React.JSX.Element[] = [];
    for (let i = 0; i < layerGroups.length; i++) {
        const { id, title, services } = layerGroups[i];
        const rowCount = getRowCount(services.length, columnCount);

        const rows: React.JSX.Element[] = [];
        for (let j = 0; j < rowCount; j++) {
            const columns: React.JSX.Element[] = [];
            for (let k = 0; k < columnCount; k++) {
                const item = services[j * columnCount + k];
                if (item) {
                    columns.push(
                        <View key={item.id} style={styles.contentContainer}>
                            <ImageButton
                                checked={layerContext.activeLayerIds.includes(item.id)}
                                onPress={() => handleLayerChange(item.id)}
                                label={item.title || "-"}
                                imageName={item.thumbnail}
                            />
                        </View>
                    );
                } else {
                    columns.push(<View key={j + "_" + k} style={styles.contentContainer} />);
                }
            }
            rows.push(
                <View key={"R_" + j} style={[styles.rowContainer, j !== rowCount - 1 && styles.marginBottom]}>
                    {columns}
                </View>
            );
        }

        groups.push(
            <Collapsible key={id} title={t(title)} lastInList={i === layerGroups.length - 1} defaultCollapsed={false}>
                {rows}
            </Collapsible>
        );
    }

    function onLayout(event: LayoutChangeEvent) {
        setWidth(event.nativeEvent.layout.width);
    }

    function onDisplayLine(lineId: string) {
        if (!visibleLines[lineId]) {
            return; // Don't zoom if line is not visible
        }
        zoomToShape(lineId, "line");
        navigation.goBack();
    }

    function onDisplayPolygon(polygonId: string) {
        if (!visiblePolygons[polygonId]) {
            return; // Don't zoom if polygon is not visible
        }
        zoomToShape(polygonId, "polygon");
        navigation.goBack();
    }

    return (
        <View style={styles.container} onLayout={onLayout}>
            <Header
                title={t("map.settings.title")}
                showBackButton={false}
                showCloseButton
                onCloseButtonPress={navigation.goBack}
                showTopInset={Platform.OS !== "ios"}
            />
            <ScrollView
                contentContainerStyle={[
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 16,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                {groups}
                {lines.length > 0 ? (
                    <Collapsible title={t("map.settings.data.addedLines")} defaultCollapsed={false} lastInList>
                        {lines.map((line) => (
                            <PressableListItem
                                key={line.id}
                                label={line.name}
                                onPress={() => onDisplayLine(line.id)}
                                rightContent={
                                    <View style={styles.listItemRightContent}>
                                        <IconButton
                                            name="trash"
                                            onPress={() => {
                                                setLineToDelete(line.id);
                                                setShowDeleteDialog(true);
                                            }}
                                        />
                                        <Switch
                                            label={line.name}
                                            checked={visibleLines[line.id] || false}
                                            onPress={() => toggleLineVisibility(line.id)}
                                        />
                                    </View>
                                }
                            />
                        ))}
                    </Collapsible>
                ) : null}

                {polygons.length > 0 ? (
                    <Collapsible title={t("map.settings.data.addedPolygons")} defaultCollapsed={false} lastInList>
                        {polygons.map((polygon) => (
                            <PressableListItem
                                key={polygon.id}
                                label={polygon.name}
                                onPress={() => onDisplayPolygon(polygon.id)}
                                rightContent={
                                    <View style={styles.listItemRightContent}>
                                        <IconButton
                                            name="trash"
                                            onPress={() => {
                                                setPolygonToDelete(polygon.id);
                                                setShowDeleteDialog(true);
                                            }}
                                        />
                                        <Switch
                                            label={polygon.name}
                                            checked={visiblePolygons[polygon.id] || false}
                                            onPress={() => togglePolygonVisibility(polygon.id)}
                                        />
                                    </View>
                                }
                            />
                        ))}
                    </Collapsible>
                ) : null}
            </ScrollView>
            <Dialog
                visible={showDeleteDialog}
                icon="delete"
                title={
                    lineToDelete
                        ? t("map.settings.data.delete", {
                              data: lines.find((l) => l.id === lineToDelete)?.name ?? "",
                          })
                        : polygonToDelete
                          ? t("map.settings.data.delete", {
                                data: polygons.find((p) => p.id === polygonToDelete)?.name ?? "",
                            })
                          : ""
                }
                description={t("map.settings.data.delete.description")}
                buttons={
                    <>
                        {lineToDelete || polygonToDelete ? (
                            <Button
                                title={t("general.delete")}
                                onPress={() =>
                                    lineToDelete
                                        ? onDeleteSavedLine(lineToDelete)
                                        : onDeleteSavedPolygon(polygonToDelete)
                                }
                            />
                        ) : null}
                        <Button
                            title={t("general.cancel")}
                            variant="secondary-outlined"
                            onPress={() => {
                                setShowDeleteDialog(false);
                                setLineToDelete(null);
                                setPolygonToDelete(null);
                            }}
                        />
                    </>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    rowContainer: {
        flexDirection: "row",
    },
    contentContainer: {
        flex: 1,
    },
    marginBottom: {
        marginBottom: 16,
    },
    listItemRightContent: {
        flexDirection: "row",
    },
});
