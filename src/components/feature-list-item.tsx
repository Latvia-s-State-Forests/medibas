import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View, Platform, StyleSheet } from "react-native";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { DistrictDamage } from "~/types/district-damages";
import { Feature } from "~/types/features";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { LargeIcon, LargeIconName } from "./icon";
import { Text } from "./text";

type FeatureListItemProps = {
    feature:
        | (Feature & { featureType: "damages" | "observations" })
        | (DistrictDamage & { featureType: "district-damages" });
    onPress: () => void;
};

export function DistrictDamageFeatureListItem(props: FeatureListItemProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const language = getAppLanguage();
    const [pressed, setPressed] = React.useState(false);
    const { featureType } = props.feature;
    function positionText(): string {
        let text = `${t("reports.coordinates")}: `;
        if (featureType !== "district-damages") {
            text += `${props.feature.geometry.coordinates[0].toFixed(
                5
            )}, ${props.feature.geometry.coordinates[1].toFixed(5)}`;
        } else {
            text += `${props.feature.locationX.toFixed(5)}, ${props.feature.locationY.toFixed(5)}`;
        }
        return text;
    }

    function icon(): LargeIconName {
        if (featureType === "district-damages") {
            return configuration.damage.typeIcons[
                props.feature.damageTypeId as keyof typeof configuration.damage.typeIcons
            ];
        }
        if (featureType === "damages") {
            return configuration.damage.typeIcons[
                props.feature.properties.type as keyof typeof configuration.damage.typeIcons
            ];
        }

        if (featureType === "observations") {
            return configuration.observations.typeIcons[
                props.feature.properties.observationTypeId as keyof typeof configuration.observations.typeIcons
            ];
        }
        return "animals";
    }

    function title(): string {
        const feature = props.feature;

        if (feature.featureType === "district-damages") {
            return (
                getDescriptionForClassifierOption(classifiers.damageTypes.options, language, feature.damageTypeId) ??
                "-"
            );
        }

        if (feature.featureType === "damages") {
            return (
                getDescriptionForClassifierOption(classifiers.damageTypes.options, language, feature.properties.type) ??
                "-"
            );
        }

        if (feature.featureType === "observations") {
            const typeTitle = getDescriptionForClassifierOption(
                classifiers.observationTypes.options,
                language,
                feature.properties.observationTypeId
            );
            const speciesTitle = getDescriptionForClassifierOption(
                classifiers.animalSpecies.options,
                language,
                feature.properties.speciesId
            );
            return `${typeTitle} - ${speciesTitle}`;
        }

        return "-";
    }

    function date(): string {
        if (featureType !== "district-damages") {
            return formatDateTime(props.feature.properties.reportCreatedOn);
        }
        return formatDateTime(props.feature.vmdAcceptedOn);
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

                <View style={styles.secondRow}>
                    <Text size={12} style={styles.date}>
                        {date()}
                    </Text>
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
    secondRow: {
        flexDirection: "row",
        gap: 8,
    },
    date: {
        flex: 1,
    },
});
