import { useNavigation } from "@react-navigation/native";
import { useActor } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, LayoutChangeEvent, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Collapsible } from "~/components/collapsible/collapsible";
import { Header } from "~/components/header";
import { ImageButton } from "~/components/image-button";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useDistricts } from "~/hooks/use-districts";
import { usePermissions } from "~/hooks/use-permissions";
import { getAppLanguage } from "~/i18n";
import { mapService } from "~/machines/map-machine";

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
    const [layerState, layerSend] = useActor(mapService);
    const [width, setWidth] = React.useState(Dimensions.get("window").width);
    const permissions = usePermissions();
    const districts = useDistricts();
    const classifiers = useClassifiers();
    const language = getAppLanguage();

    function handleLayerChange(layerId: string) {
        layerSend({ type: "TOGGLE_LAYER", layerId });
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
    const groups: JSX.Element[] = [];
    for (let i = 0; i < layerGroups.length; i++) {
        const { id, title, services } = layerGroups[i];
        const rowCount = getRowCount(services.length, columnCount);

        const rows: JSX.Element[] = [];
        for (let j = 0; j < rowCount; j++) {
            const columns: JSX.Element[] = [];
            for (let k = 0; k < columnCount; k++) {
                const item = services[j * columnCount + k];
                if (item) {
                    columns.push(
                        <View key={item.id} style={styles.contentContainer}>
                            <ImageButton
                                checked={layerState.context.activeLayerIds.includes(item.id)}
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
            </ScrollView>
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
});
