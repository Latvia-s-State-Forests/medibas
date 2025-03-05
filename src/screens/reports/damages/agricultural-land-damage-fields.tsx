import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { DamageTypeId, SpeciesId } from "~/types/classifiers";
import { AgriculturalLandDamageAttributes, Feature } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";

const DEFAULT_DESCRIPTION = "-";

type AgriculturalLandDamageFieldsProps = {
    feature: Feature<AgriculturalLandDamageAttributes>;
};

export function AgriculturalLandDamageFields(props: AgriculturalLandDamageFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const attributes = props.feature.attributes;

    const damageType =
        getDescriptionForClassifierOption(classifiers.damageTypes.options, language, DamageTypeId.AgriculturalLand) ??
        DEFAULT_DESCRIPTION;

    const agriculturalLandType =
        getDescriptionForClassifierOption(
            classifiers.agriculturalTypes.options,
            language,
            attributes.agriculturalLandTypeId
        ) ?? DEFAULT_DESCRIPTION;

    let responsibleSpecies =
        getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, attributes.speciesId) ??
        DEFAULT_DESCRIPTION;
    if (attributes.speciesId === SpeciesId.Other && attributes.otherSpecies) {
        responsibleSpecies = responsibleSpecies + " - " + attributes.otherSpecies;
    }

    const isCountable =
        classifiers.agriculturalTypes.options.find((option) => option.id === attributes.agriculturalLandTypeId)
            ?.isCountable ?? false;

    const damagedLivestockCount = attributes.count?.toString() ?? DEFAULT_DESCRIPTION;

    const damagedAreaHectares = attributes.damagedArea?.toString() ?? DEFAULT_DESCRIPTION;

    return (
        <View style={styles.container}>
            <ReadOnlyField label={t("damage.damageType")} value={damageType} />
            <ReadOnlyField label={t("damage.land.type")} value={agriculturalLandType} />
            <ReadOnlyField label={t("damage.land.species")} value={responsibleSpecies} />
            {isCountable ? (
                <ReadOnlyField label={t("damage.land.count")} value={damagedLivestockCount} />
            ) : (
                <ReadOnlyField label={t("damage.land.area")} value={damagedAreaHectares} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
