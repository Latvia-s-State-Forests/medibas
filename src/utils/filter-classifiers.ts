import { match } from "ts-pattern";
import { AppLanguage } from "~/i18n";
import { AgriculturalLandTypeId, ClassifierOption, Classifiers, SpeciesClassifierOption } from "~/types/classifiers";

export function getActiveClassifiers(classifiers: Classifiers, classifier: keyof Classifiers) {
    return classifiers[classifier].options.filter(isOptionActive);
}

export function getObservationSpecies(classifiers: Classifiers) {
    const filteredOptions = classifiers.animalSpecies.options.filter(
        (option) => isOptionActive(option) && option.isMainGroupObservation
    );

    // For these options 'listOrderObservation' should be present, if not - put them at the end
    filteredOptions.sort((a, b) => (a.listOrderObservation ?? Infinity) - (b.listOrderObservation ?? Infinity));

    return filteredOptions;
}

export function getObservationOtherMammals(classifiers: Classifiers, language: AppLanguage) {
    const filteredOptions = classifiers.animalSpecies.options.filter((option) => {
        // Ignore null values by checking for false
        return (
            isOptionActive(option) &&
            option.isValidForObservation &&
            option.isMainGroupObservation === false &&
            option.isMammal
        );
    });

    filteredOptions.sort(sortOptionsByDescription(language));

    return filteredOptions;
}

export function getObservationBirds(classifiers: Classifiers, language: AppLanguage) {
    const filteredOptions = classifiers.animalSpecies.options.filter((option) => {
        // Ignore null values by checking for false
        return (
            isOptionActive(option) &&
            option.isValidForObservation &&
            option.isMainGroupObservation === false &&
            option.isMammal === false
        );
    });

    filteredOptions.sort(sortOptionsByDescription(language));

    return filteredOptions;
}

export function getAgriculturalLandTypes(classifiers: Classifiers) {
    const filteredOptions = classifiers.agriculturalTypes.options.filter((option) => {
        const isOtherType = option.isMainType === undefined;
        return isOptionActive(option) && (option.isMainType || isOtherType);
    });

    return filteredOptions;
}

export function getAgriculturalLandSubtypes(classifiers: Classifiers) {
    const filteredOptions = classifiers.agriculturalTypes.options.filter((option) => {
        const isSubtype = option.isMainType === false;
        const isOtherSubtype = option.isMainType === undefined;
        return isOptionActive(option) && (isSubtype || isOtherSubtype);
    });

    return filteredOptions;
}

export function getAgriculturalLandSpecies(
    species: SpeciesClassifierOption[],
    type: AgriculturalLandTypeId | undefined
) {
    return match(type)
        .with(AgriculturalLandTypeId.Cropping, () => getAgriculturalLandCroppingSpecies(species))
        .with(AgriculturalLandTypeId.Livestock, () => getAgriculturalLandLivestockSpecies(species))
        .with(AgriculturalLandTypeId.Poultry, () => getAgriculturalLandPoultrySpecies(species))
        .with(AgriculturalLandTypeId.Beekeeping, () => getAgriculturalLandBeekeepingSpecies(species))
        .otherwise(() => []);
}

export function getDamagedTreeSpecies(classifiers: Classifiers) {
    const filteredOptions = classifiers.treeSpecies.options.filter(
        (option) => isOptionActive(option) && option.isMainGroupDamage
    );

    // For these options 'listOrder' should be present, if not - put them at the end
    filteredOptions.sort((a, b) => (a.listOrder ?? Infinity) - (b.listOrder ?? Infinity));

    return filteredOptions;
}

export function getOtherDamagedTreeSpecies(classifiers: Classifiers, language: AppLanguage) {
    const filteredOptions = classifiers.treeSpecies.options.filter(
        (option) => isOptionActive(option) && option.isMainGroupDamage === false
    );

    filteredOptions.sort(sortOptionsByDescription(language));

    return filteredOptions;
}

export function getResponsibleSpeciesForForestDamage(species: SpeciesClassifierOption[]) {
    return species
        .filter((option) => isOptionActive(option) && option.doesDamageForest === true)
        .sort((a, b) => {
            const aOrder = a.listOrderDamageForest ?? Infinity;
            const bOrder = b.listOrderDamageForest ?? Infinity;
            return aOrder - bOrder;
        });
}

export function getResponsibleSpeciesForInfrastructureDamage(species: SpeciesClassifierOption[]) {
    return species
        .filter((option) => isOptionActive(option) && option.doesDamageInfrastructure === true)
        .sort((a, b) => {
            const aOrder = a.listOrderDamageInfrastructure ?? Infinity;
            const bOrder = b.listOrderDamageInfrastructure ?? Infinity;
            return aOrder - bOrder;
        });
}

export function isOptionActive(option: ClassifierOption) {
    const currentDate = new Date();

    if (option.activeFrom && new Date(option.activeFrom) > currentDate) {
        return false;
    }

    if (option.activeTo && new Date(option.activeTo) < currentDate) {
        return false;
    }

    return true;
}

function sortOptionsByDescription(language: AppLanguage) {
    return (a: ClassifierOption, b: ClassifierOption) =>
        (a.description[language] ?? "").localeCompare(b.description[language] ?? "");
}

function getAgriculturalLandCroppingSpecies(species: SpeciesClassifierOption[]) {
    return species
        .filter((option) => isOptionActive(option) && option.doesDamageCrops)
        .sort((a, b) => {
            const aOrder = a.listOrderDamageCrops ?? Infinity;
            const bOrder = b.listOrderDamageCrops ?? Infinity;
            return aOrder - bOrder;
        });
}

function getAgriculturalLandLivestockSpecies(species: SpeciesClassifierOption[]) {
    return species
        .filter((option) => isOptionActive(option) && option.doesDamageLivestock)
        .sort((a, b) => {
            const aOrder = a.listOrderDamageLivestock ?? Infinity;
            const bOrder = b.listOrderDamageLivestock ?? Infinity;
            return aOrder - bOrder;
        });
}

function getAgriculturalLandPoultrySpecies(species: SpeciesClassifierOption[]) {
    return species
        .filter((option) => isOptionActive(option) && option.doesDamagePoultry)
        .sort((a, b) => {
            const aOrder = a.listOrderDamagePoultry ?? Infinity;
            const bOrder = b.listOrderDamagePoultry ?? Infinity;
            return aOrder - bOrder;
        });
}

function getAgriculturalLandBeekeepingSpecies(species: SpeciesClassifierOption[]) {
    return species
        .filter((option) => isOptionActive(option) && option.doesDamageBees)
        .sort((a, b) => {
            const aOrder = a.listOrderDamageBees ?? Infinity;
            const bOrder = b.listOrderDamageBees ?? Infinity;
            return aOrder - bOrder;
        });
}
