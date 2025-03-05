import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { DamageTypeId, SpeciesId } from "~/types/classifiers";
import { Feature, ForestDamageAttributes } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { getReportFieldListItems } from "~/utils/get-report-field-list-items";

const DEFAULT_DESCRIPTION = "-";

type ForestDamageFieldsProps = {
    feature: Feature<ForestDamageAttributes>;
};

export function ForestDamageFields(props: ForestDamageFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const attributes = props.feature.attributes;

    const damageType =
        getDescriptionForClassifierOption(classifiers.damageTypes.options, language, DamageTypeId.Forest) ??
        DEFAULT_DESCRIPTION;

    const damagedArea = String(attributes.damagedArea);

    const isForestProtectionDone = attributes.forestProtectionDone
        ? t("damage.forest.standProtection.yes")
        : t("damage.forest.standProtection.no");

    const damagedTreeSpecies = getReportFieldListItems(
        attributes.damagedTreeSpeciesIds,
        classifiers.treeSpecies.options,
        language
    );

    const damageVolume =
        getDescriptionForClassifierOption(
            classifiers.damageVolumeTypes.options,
            language,
            attributes.damageVolumeTypeId
        ) ?? DEFAULT_DESCRIPTION;

    let responsibleSpecies =
        getDescriptionForClassifierOption(
            classifiers.animalSpecies.options,
            language,
            attributes.responsibleAnimalSpeciesId
        ) ?? DEFAULT_DESCRIPTION;
    if (attributes.responsibleAnimalSpeciesId === SpeciesId.Other && attributes.otherResponsibleAnimalSpecies) {
        responsibleSpecies = responsibleSpecies + " - " + attributes.otherResponsibleAnimalSpecies;
    }

    const damageTypes = getReportFieldListItems(
        attributes.damageTypeIds,
        classifiers.forestDamageTypes.options,
        language
    );

    return (
        <View style={styles.container}>
            <ReadOnlyField label={t("damage.damageType")} value={damageType} />
            <ReadOnlyField label={t("damage.land.area")} value={damagedArea} />
            <ReadOnlyField label={t("damage.forest.standProtection.label")} value={isForestProtectionDone} />
            <ReadOnlyField label={t("damage.forest.damagedTreeSpecies")} value={damagedTreeSpecies} />
            <ReadOnlyField label={t("damage.forest.damageVolumeType")} value={damageVolume} />
            <ReadOnlyField label={t("damage.forest.responsibleSpecies")} value={responsibleSpecies} />
            <ReadOnlyField label={t("damage.forest.damageTypes")} value={damageTypes} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
