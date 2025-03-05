import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInRight, FadeOutRight } from "react-native-reanimated";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { DistrictDamageFields } from "~/screens/damage/district-damage/district-damage-fields";
import { DistrictDamage } from "~/types/district-damages";
import { Feature } from "~/types/features";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { Text } from "./text";

type SelectedFeatureDetailProps = {
    selectedFeatureData:
        | (Feature & { featureType: "damages" | "observations" })
        | (DistrictDamage & { featureType: "district-damages" })
        | undefined;
};

export default function SelectedFeatureDetail(props: SelectedFeatureDetailProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const language = getAppLanguage();

    if (!props.selectedFeatureData) {
        return (
            <View style={styles.scroll}>
                <Text style={styles.text}>{t("dataError")}</Text>
            </View>
        );
    }

    if (props.selectedFeatureData.featureType === "district-damages") {
        return (
            <Animated.ScrollView contentContainerStyle={styles.scroll} entering={FadeInRight} exiting={FadeOutRight}>
                <DistrictDamageFields damage={props.selectedFeatureData} />
            </Animated.ScrollView>
        );
    } else {
        const formattedDateTime = formatDateTime(props.selectedFeatureData.properties.reportCreatedOn);
        const observationTypeId = props.selectedFeatureData.properties.observationTypeId;
        const damageTypeId = props.selectedFeatureData.properties.type;
        const speciesId = props.selectedFeatureData.properties.speciesId;
        const species = getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, speciesId);
        const damageType = getDescriptionForClassifierOption(classifiers.damageTypes.options, language, damageTypeId);
        const observationType = getDescriptionForClassifierOption(
            classifiers.observationTypes.options,
            language,
            observationTypeId
        );

        return (
            <Animated.View style={styles.scroll} entering={FadeInRight} exiting={FadeOutRight}>
                <ReadOnlyField
                    label={t("reports.coordinates")}
                    value={props.selectedFeatureData.geometry.coordinates.join(", ") ?? ""}
                />
                <ReadOnlyField
                    label={
                        props.selectedFeatureData.featureType === "damages"
                            ? t("damage.dateAndTime")
                            : t("observations.dateAndTime")
                    }
                    value={formattedDateTime}
                />
                {observationType ? (
                    <ReadOnlyField label={t("observations.observationType")} value={observationType} />
                ) : null}
                {damageType ? <ReadOnlyField label={t("damage.damageType")} value={damageType} /> : null}
                {species ? <ReadOnlyField label={t("damage.land.species")} value={species} /> : null}
                {props.selectedFeatureData.properties.description ? (
                    <ReadOnlyField label={t("hunt.notes")} value={props.selectedFeatureData.properties.description} />
                ) : null}
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: 16,
        gap: 10,
        paddingVertical: 10,
    },
    text: {
        textAlign: "center",
    },
});
