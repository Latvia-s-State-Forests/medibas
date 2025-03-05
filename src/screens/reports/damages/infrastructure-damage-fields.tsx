import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { DamageTypeId, InfrastructureDamageTypeId, SpeciesId } from "~/types/classifiers";
import { Feature, InfrastructureDamageAttributes } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";

const DEFAULT_DESCRIPTION = "-";

type InfrastructureDamageFieldsProps = {
    feature: Feature<InfrastructureDamageAttributes>;
};

export function InfrastructureDamageFields(props: InfrastructureDamageFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const attributes = props.feature.attributes;

    const damageType =
        getDescriptionForClassifierOption(classifiers.damageTypes.options, language, DamageTypeId.Infrastructure) ??
        DEFAULT_DESCRIPTION;

    let infrastructureType =
        getDescriptionForClassifierOption(
            classifiers.infrastructureTypes.options,
            language,
            attributes.infrastructureTypeId
        ) ?? DEFAULT_DESCRIPTION;
    if (attributes.infrastructureTypeId === InfrastructureDamageTypeId.Other && attributes.otherInfrastructureType) {
        infrastructureType = infrastructureType + " - " + attributes.otherInfrastructureType;
    }

    let responsibleSpecies =
        getDescriptionForClassifierOption(
            classifiers.animalSpecies.options,
            language,
            attributes.responsibleAnimalSpeciesId
        ) ?? DEFAULT_DESCRIPTION;
    if (attributes.responsibleAnimalSpeciesId === SpeciesId.Other && attributes.otherResponsibleAnimalSpecies) {
        responsibleSpecies = responsibleSpecies + " - " + attributes.otherResponsibleAnimalSpecies;
    }

    return (
        <View style={styles.container}>
            <ReadOnlyField label={t("damage.damageType")} value={damageType} />
            <ReadOnlyField label={t("damage.infrastructure.type")} value={infrastructureType} />
            <ReadOnlyField label={t("damage.infrastructure.responsibleSpecies")} value={responsibleSpecies} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
