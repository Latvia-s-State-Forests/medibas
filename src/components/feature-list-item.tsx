import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { ObservationTypeId } from "~/types/classifiers";
import { DistrictDamage } from "~/types/district-damages";
import { Feature } from "~/types/features";
import { HuntedAnimal } from "~/types/hunted-animals";
import { Infrastructure } from "~/types/infrastructure";
import { UnlimitedHuntedAnimal } from "~/types/unlimited-hunted-animals";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { isEditedInfrastructureNewer } from "~/utils/is-edited-infrastructure-newer";
import { LargeIcon, LargeIconName } from "./icon";
import { Text } from "./text";

type FeatureListItemProps = {
    feature:
        | (Feature & { featureType: "damages" | "observations" })
        | (DistrictDamage & { featureType: "district-damages" })
        | (Infrastructure & { featureType: "district-infrastructures" })
        | (HuntedAnimal & { featureType: "district-hunted-others" })
        | (HuntedAnimal & { featureType: "district-hunted-red-deer" })
        | (HuntedAnimal & { featureType: "district-hunted-moose" })
        | (HuntedAnimal & { featureType: "district-hunted-roe-deer" })
        | (HuntedAnimal & { featureType: "district-hunted-boar" })
        | (UnlimitedHuntedAnimal & { featureType: "district-hunted-others-unlimited" });
    onPress: () => void;
};

export function FeatureListItem(props: FeatureListItemProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const language = getAppLanguage();
    const UNKNOWN_SPECIES = t("features.unknownSpecies");
    const UNKNOWN_TYPE = t("features.unknownType");
    const [pressed, setPressed] = React.useState(false);
    const { featureType } = props.feature;
    function positionText(): string {
        let text = `${t("reports.coordinates")}: `;
        if (
            featureType !== "district-damages" &&
            featureType !== "district-infrastructures" &&
            featureType !== "district-hunted-others" &&
            featureType !== "district-hunted-red-deer" &&
            featureType !== "district-hunted-moose" &&
            featureType !== "district-hunted-roe-deer" &&
            featureType !== "district-hunted-boar" &&
            featureType !== "district-hunted-others-unlimited"
        ) {
            text += `${props.feature.geometry.coordinates[1].toFixed(
                5
            )}, ${props.feature.geometry.coordinates[0].toFixed(5)}`;
        } else if (
            featureType === "district-hunted-others" ||
            featureType === "district-hunted-red-deer" ||
            featureType === "district-hunted-moose" ||
            featureType === "district-hunted-roe-deer" ||
            featureType === "district-hunted-boar" ||
            featureType === "district-hunted-others-unlimited"
        ) {
            text += `${props.feature.location[1].toFixed(5)}, ${props.feature.location[0].toFixed(5)}`;
        } else {
            text += `${props.feature.locationY.toFixed(5)}, ${props.feature.locationX.toFixed(5)}`;
        }
        return text;
    }

    function icon(): LargeIconName {
        if (featureType === "district-damages") {
            return (
                configuration.damage.typeIcons[
                    props.feature.damageTypeId as keyof typeof configuration.damage.typeIcons
                ] ?? "cross"
            );
        }

        if (featureType === "district-infrastructures") {
            return (
                configuration.huntingInfrastructure.typeIcons[
                    props.feature.typeId as keyof typeof configuration.huntingInfrastructure.typeIcons
                ] ?? "cross"
            );
        }

        if (
            featureType === "district-hunted-others" ||
            featureType === "district-hunted-red-deer" ||
            featureType === "district-hunted-moose" ||
            featureType === "district-hunted-roe-deer" ||
            featureType === "district-hunted-boar" ||
            featureType === "district-hunted-others-unlimited"
        ) {
            return (
                configuration.hunt.speciesIcons[
                    props.feature.speciesId as keyof typeof configuration.hunt.speciesIcons
                ] ?? "animals"
            );
        }

        if (featureType === "damages") {
            return (
                configuration.damage.typeIcons[
                    props.feature.properties.type as keyof typeof configuration.damage.typeIcons
                ] ?? "cross"
            );
        }

        if (featureType === "observations") {
            if (props.feature.properties.observationTypeId === ObservationTypeId.DirectlyObservedAnimals) {
                return (
                    configuration.observations.speciesIcons[
                        props.feature.properties.speciesId as keyof typeof configuration.observations.speciesIcons
                    ] ?? "animals"
                );
            }
            return (
                configuration.observations.typeIcons[
                    props.feature.properties.observationTypeId as keyof typeof configuration.observations.typeIcons
                ] ?? "cross"
            );
        }

        return "animals";
    }

    function title(): string {
        const feature = props.feature;

        if (feature.featureType === "district-damages") {
            return (
                getDescriptionForClassifierOption(classifiers.damageTypes.options, language, feature.damageTypeId) ??
                UNKNOWN_TYPE
            );
        }

        if (feature.featureType === "district-infrastructures") {
            return (
                getDescriptionForClassifierOption(
                    classifiers.huntingInfrastructureTypes.options,
                    language,
                    feature.typeId
                ) ?? UNKNOWN_TYPE
            );
        }

        if (
            feature.featureType === "district-hunted-others" ||
            feature.featureType === "district-hunted-red-deer" ||
            feature.featureType === "district-hunted-moose" ||
            feature.featureType === "district-hunted-roe-deer" ||
            feature.featureType === "district-hunted-boar" ||
            feature.featureType === "district-hunted-others-unlimited"
        ) {
            return (
                getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, feature.speciesId) ??
                UNKNOWN_SPECIES
            );
        }

        if (feature.featureType === "damages") {
            return (
                getDescriptionForClassifierOption(classifiers.damageTypes.options, language, feature.properties.type) ??
                UNKNOWN_TYPE
            );
        }

        if (feature.featureType === "observations") {
            const typeTitle =
                getDescriptionForClassifierOption(
                    classifiers.observationTypes.options,
                    language,
                    feature.properties.observationTypeId
                ) ?? UNKNOWN_TYPE;
            const speciesTitle =
                getDescriptionForClassifierOption(
                    classifiers.animalSpecies.options,
                    language,
                    feature.properties.speciesId
                ) ?? UNKNOWN_SPECIES;
            return `${typeTitle} - ${speciesTitle}`;
        }

        return "-";
    }

    function date(): string {
        if (
            featureType === "district-hunted-others" ||
            featureType === "district-hunted-red-deer" ||
            featureType === "district-hunted-moose" ||
            featureType === "district-hunted-roe-deer" ||
            featureType === "district-hunted-boar" ||
            featureType === "district-hunted-others-unlimited"
        ) {
            return formatDateTime(props.feature.huntedTime);
        }
        if (featureType === "district-damages") {
            return formatDateTime(props.feature.vmdAcceptedOn);
        }
        if (featureType === "district-infrastructures") {
            return formatDateTime(props.feature.createdOnDevice);
        }
        return formatDateTime(props.feature.properties.reportCreatedOn);
    }

    return (
        <Pressable
            onPress={props.onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[styles.container, pressed ? styles.pressed : styles.shadow]}
        >
            <View style={styles.leftContainer}>
                <LargeIcon name={icon()} />
            </View>
            <View style={styles.rightContainer}>
                <View style={styles.firstRow}>
                    <Text weight="bold" style={styles.title}>
                        {title()}
                    </Text>
                </View>

                <View style={styles.dateRows}>
                    {featureType === "district-infrastructures" ? (
                        <>
                            <Text size={12} style={styles.date}>
                                {t("mtl.infrastructure.added")}: {formatDateTime(props.feature.createdOnDevice)}
                            </Text>
                            {isEditedInfrastructureNewer(
                                props.feature.createdOnDevice,
                                props.feature.changedOnDevice
                            ) && (
                                <Text size={12} style={styles.date}>
                                    {t("mtl.infrastructure.edited")}: {formatDateTime(props.feature.changedOnDevice)}
                                </Text>
                            )}
                        </>
                    ) : (
                        <Text size={12} style={styles.date}>
                            {date()}
                        </Text>
                    )}
                </View>
                <Text size={12}>{positionText()}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 16,
        gap: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    pressed: {
        backgroundColor: theme.color.gray2,
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.08,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    leftContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    rightContainer: {
        flex: 1,
        gap: 6,
    },
    firstRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    title: {
        flex: 1,
    },
    dateRows: {
        gap: 4,
    },
    date: {
        flex: 1,
    },
});
