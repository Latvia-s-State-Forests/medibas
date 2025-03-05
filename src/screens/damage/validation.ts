import { i18n } from "~/i18n";
import {
    AgriculturalLandTypeId,
    Classifiers,
    DamageTypeId,
    InfrastructureDamageTypeId,
    SpeciesId,
    TreeSpeciesId,
} from "~/types/classifiers";
import { DamageState, ForestDamageState, InfrastructureDamageState, LandDamageState } from "~/types/damage";
import { isLandDamageAreaVisible } from "./is-land-damage-area-visible";
import { isLandDamageCountVisible } from "./is-land-damage-count-visible";

function getErrorMessage(fieldName: string): string {
    return `"${fieldName}" ${i18n.t("validation.requiredField")}`;
}

export function getLandDamageValidationErrors(land: LandDamageState, classifiers: Classifiers): string[] {
    const errors: string[] = [];

    if (!land.type) {
        errors.push(getErrorMessage(i18n.t("damage.land.type")));
    }

    const isOtherType = land.type === AgriculturalLandTypeId.Other;
    const isCroppingOrLivestock =
        land.type === AgriculturalLandTypeId.Cropping || land.type === AgriculturalLandTypeId.Livestock;
    const isOtherSubtype = land.subtype === AgriculturalLandTypeId.Other;
    if (isOtherType && isOtherSubtype && !land.customSpecies) {
        errors.push(getErrorMessage(i18n.t("damage.land.species")));
    }

    if (isOtherType && !land.subtype) {
        errors.push(getErrorMessage(i18n.t("damage.land.subtype")));
    }

    if (isOtherType && land.subtype && !isOtherSubtype && !land.species) {
        errors.push(getErrorMessage(i18n.t("damage.land.species")));
    }

    if (!isOtherType && !land.species && isCroppingOrLivestock) {
        errors.push(getErrorMessage(i18n.t("damage.land.species")));
    }

    const isOtherSpecies = land.species === SpeciesId.Other;
    if (isOtherSpecies && !land.otherSpecies) {
        errors.push(getErrorMessage(i18n.t("damage.land.otherSpecies")));
    }

    const isAreaVisible = isLandDamageAreaVisible(
        land.type ?? 0,
        land.subtype ?? 0,
        classifiers.agriculturalTypes?.options ?? []
    );
    if (isAreaVisible && !land.area) {
        errors.push(getErrorMessage(i18n.t("damage.land.area")));
    }

    const isCountVisible = isLandDamageCountVisible(
        land.type ?? 0,
        land.subtype ?? 0,
        classifiers.agriculturalTypes.options
    );
    if (isCountVisible && land.count < 1) {
        errors.push(getErrorMessage(i18n.t("damage.land.count")));
    }

    return errors;
}

export function getForestDamageValidationErrors({
    area,
    standProtection,
    damageVolumeType,
    damagedTreeSpecies,
    otherDamagedTreeSpecies,
    responsibleSpecies,
    otherResponsibleSpecies,
    damageTypes,
}: ForestDamageState): string[] {
    const errors: string[] = [];
    if (!area) {
        errors.push(getErrorMessage(i18n.t("damage.forest.area")));
    }

    if (!standProtection) {
        errors.push(getErrorMessage(i18n.t("damage.forest.standProtection.label")));
    }

    // Must have at least one checked type
    if (Object.values(damagedTreeSpecies).every((treeSpecies) => !treeSpecies)) {
        errors.push(getErrorMessage(i18n.t("damage.forest.damagedTreeSpecies")));
    }

    if (!damageVolumeType) {
        errors.push(getErrorMessage(i18n.t("damage.forest.damageVolumeType")));
    }

    if (!responsibleSpecies) {
        errors.push(getErrorMessage(i18n.t("damage.forest.responsibleSpecies")));
    }

    const isOtherDamagedTreeSpeciesChecked = damagedTreeSpecies[TreeSpeciesId.Other];
    if (isOtherDamagedTreeSpeciesChecked && !otherDamagedTreeSpecies) {
        errors.push(getErrorMessage(i18n.t("damage.land.otherSpecies")));
    }

    const isOtherResponsibleSpeciesChecked = responsibleSpecies === SpeciesId.Other;
    if (isOtherResponsibleSpeciesChecked && !otherResponsibleSpecies) {
        errors.push(getErrorMessage(i18n.t("damage.land.otherSpecies")));
    }

    // Must have at least one checked type
    if (Object.values(damageTypes).every((type) => !type)) {
        errors.push(getErrorMessage(i18n.t("damage.forest.damageTypes")));
    }

    return errors;
}

export function getInfrastructureDamageValidationErrors({
    type,
    otherType,
    responsibleSpecies,
    otherResponsibleSpecies,
}: InfrastructureDamageState): string[] {
    const errors: string[] = [];

    const isOtherDamageType = type === InfrastructureDamageTypeId.Other;
    if (isOtherDamageType && !otherType) {
        errors.push(getErrorMessage(i18n.t("damage.infrastructure.otherType")));
    }

    if (!isOtherDamageType && !type) {
        errors.push(getErrorMessage(i18n.t("damage.infrastructure.type")));
    }

    const isOtherResponsibleSpecies = responsibleSpecies === SpeciesId.Other;
    if (isOtherResponsibleSpecies && !otherResponsibleSpecies) {
        errors.push(getErrorMessage(i18n.t("damage.infrastructure.otherResponsibleSpecies")));
    }

    if (!isOtherResponsibleSpecies && !responsibleSpecies) {
        errors.push(getErrorMessage(i18n.t("damage.infrastructure.responsibleSpecies")));
    }

    return errors;
}

export function getDamageValidationErrors(
    { position, photo, type, land, forest, infrastructure }: DamageState,
    classifiers: Classifiers
): string[] {
    const errors: string[] = [];
    if (!position) {
        errors.push(getErrorMessage(i18n.t("damage.position")));
    }

    if (type === DamageTypeId.AgriculturalLand) {
        errors.push(...getLandDamageValidationErrors(land, classifiers));
    }

    if (type === DamageTypeId.Forest) {
        errors.push(...getForestDamageValidationErrors(forest));
    }

    if (type === DamageTypeId.Infrastructure) {
        errors.push(...getInfrastructureDamageValidationErrors(infrastructure));
    }

    if (!photo) {
        errors.push(getErrorMessage(i18n.t("damage.photo")));
    }
    return errors;
}
