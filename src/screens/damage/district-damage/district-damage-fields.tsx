import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { match } from "ts-pattern";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { DamageTypeId, InfrastructureDamageTypeId, SpeciesId } from "~/types/classifiers";
import {
    DistrictAgriculturalLandDamage,
    DistrictDamage,
    DistrictForestDamage,
    DistrictInfrastructureDamage,
} from "~/types/district-damages";
import { getDescriptionForClassifierOption, getDescriptionForClassifierOptions } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { getCoordinates } from "~/utils/get-coordinates";

const DEFAULT_DESCRIPTION = "-";

type DistrictDamageFieldsProps = {
    damage: DistrictDamage;
};

export function DistrictDamageFields(props: DistrictDamageFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();

    const coordinates = getCoordinates(props.damage);

    const createdOn = formatDateTime(props.damage.vmdAcceptedOn);

    const damageType =
        getDescriptionForClassifierOption(classifiers.damageTypes.options, language, props.damage.damageTypeId) ??
        DEFAULT_DESCRIPTION;

    return (
        <View style={styles.container}>
            <ReadOnlyField label={t("reports.coordinates")} value={coordinates} />

            <ReadOnlyField label={t("damage.dateAndTime")} value={createdOn} />

            <ReadOnlyField label={t("damage.damageType")} value={damageType} />

            {match(props.damage)
                .with({ damageTypeId: DamageTypeId.AgriculturalLand }, (damage) => (
                    <AgriculturalLandDamageFields damage={damage} />
                ))
                .with({ damageTypeId: DamageTypeId.Forest }, (damage) => <ForestDamageFields damage={damage} />)
                .with({ damageTypeId: DamageTypeId.Infrastructure }, (damage) => (
                    <InfrastructureDamageFields damage={damage} />
                ))
                .otherwise(() => null)}

            {props.damage.notes ? <ReadOnlyField label={t("damage.notes")} value={props.damage.notes} /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});

type AgriculturalLandDamageFieldsProps = {
    damage: DistrictAgriculturalLandDamage;
};

function AgriculturalLandDamageFields(props: AgriculturalLandDamageFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();

    const agriculturalLandType =
        getDescriptionForClassifierOption(
            classifiers.agriculturalTypes.options,
            language,
            props.damage.agriculturalTypeId
        ) ?? DEFAULT_DESCRIPTION;

    let responsibleSpecies =
        getDescriptionForClassifierOption(
            classifiers.animalSpecies.options,
            language,
            props.damage.speciesResponsibleId
        ) ?? DEFAULT_DESCRIPTION;
    if (props.damage.speciesResponsibleId === SpeciesId.Other && props.damage.otherResponsibleSpecies) {
        responsibleSpecies = responsibleSpecies + " - " + props.damage.otherResponsibleSpecies;
    }

    const isCountable =
        classifiers.agriculturalTypes.options.find((option) => option.id === props.damage.agriculturalTypeId)
            ?.isCountable ?? false;

    const damagedLivestockCount = props.damage.damagedLivestockCount?.toString() ?? DEFAULT_DESCRIPTION;

    const damagedAreaHectares = props.damage.damagedAreaHectares?.toString() ?? DEFAULT_DESCRIPTION;

    return (
        <>
            <ReadOnlyField label={t("damage.land.type")} value={agriculturalLandType} />

            <ReadOnlyField label={t("damage.land.species")} value={responsibleSpecies} />

            {isCountable ? (
                <ReadOnlyField label={t("damage.land.count")} value={damagedLivestockCount} />
            ) : (
                <ReadOnlyField label={t("damage.land.area")} value={damagedAreaHectares} />
            )}
        </>
    );
}

type ForestDamageFieldsProps = {
    damage: DistrictForestDamage;
};

function ForestDamageFields(props: ForestDamageFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();

    const damagedArea = String(props.damage.damagedAreaHectares);

    const isForestProtectionDone = props.damage.isForestProtectionDone
        ? t("damage.forest.standProtection.yes")
        : t("damage.forest.standProtection.no");

    const damagedTreeSpecies = getDescriptionForClassifierOptions(
        classifiers.treeSpecies.options,
        language,
        props.damage.damagedTreeSpecies
    );

    const damageVolume =
        getDescriptionForClassifierOption(
            classifiers.damageVolumeTypes.options,
            language,
            props.damage.freshDamageVolumeId
        ) ?? DEFAULT_DESCRIPTION;

    let responsibleSpecies =
        getDescriptionForClassifierOption(
            classifiers.animalSpecies.options,
            language,
            props.damage.speciesResponsibleId
        ) ?? DEFAULT_DESCRIPTION;
    if (props.damage.speciesResponsibleId === SpeciesId.Other && props.damage.otherResponsibleSpecies) {
        responsibleSpecies = responsibleSpecies + " - " + props.damage.otherResponsibleSpecies;
    }

    const damageTypes = getDescriptionForClassifierOptions(
        classifiers.forestDamageTypes.options,
        language,
        props.damage.forestDamages
    );

    return (
        <>
            <ReadOnlyField label={t("damage.land.area")} value={damagedArea} />
            <ReadOnlyField label={t("damage.forest.standProtection.label")} value={isForestProtectionDone} />
            <ReadOnlyField label={t("damage.forest.damagedTreeSpecies")} value={damagedTreeSpecies} />
            <ReadOnlyField label={t("damage.forest.damageVolumeType")} value={damageVolume} />
            <ReadOnlyField label={t("damage.forest.responsibleSpecies")} value={responsibleSpecies} />
            <ReadOnlyField label={t("damage.forest.damageTypes")} value={damageTypes} />
        </>
    );
}

type InfrastructureDamageFieldsProps = {
    damage: DistrictInfrastructureDamage;
};

function InfrastructureDamageFields(props: InfrastructureDamageFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();

    let type =
        getDescriptionForClassifierOption(
            classifiers.infrastructureTypes.options,
            language,
            props.damage.infrastructureTypeId
        ) ?? DEFAULT_DESCRIPTION;
    if (
        props.damage.infrastructureTypeId === InfrastructureDamageTypeId.Other &&
        props.damage.infrastructureTypeOther
    ) {
        type = type + " - " + props.damage.infrastructureTypeOther;
    }

    let responsibleSpecies =
        getDescriptionForClassifierOption(
            classifiers.animalSpecies.options,
            language,
            props.damage.speciesResponsibleId
        ) ?? DEFAULT_DESCRIPTION;
    if (props.damage.speciesResponsibleId === SpeciesId.Other && props.damage.otherResponsibleSpecies) {
        responsibleSpecies = responsibleSpecies + " - " + props.damage.otherResponsibleSpecies;
    }

    return (
        <>
            <ReadOnlyField label={t("damage.infrastructure.type")} value={type} />
            <ReadOnlyField label={t("damage.infrastructure.responsibleSpecies")} value={responsibleSpecies} />
        </>
    );
}
