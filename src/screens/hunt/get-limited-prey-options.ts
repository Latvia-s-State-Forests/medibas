import { configuration } from "~/configuration";
import { ClassifierOption, Classifiers, HuntedTypeId } from "~/types/classifiers";
import { Permit } from "~/types/permits";
import { isOptionActive } from "~/utils/filter-classifiers";

export function getLimitedPreyOptions(
    permit: Permit,
    classifiers: Classifiers,
    selectedType: string,
    selectedGender: string,
    selectedAge: string
): {
    types: ClassifierOption[];
    typeId: number;
    genders: ClassifierOption[];
    genderId: number;
    ages: ClassifierOption[];
    ageId: number;
} {
    const types = classifiers.huntedTypes.options.filter((option) => {
        if (!isOptionActive(option)) {
            return false;
        }

        const permitType = classifiers.permitTypes.options.find((option) => option.id === permit.permitTypeId);
        if (!permitType) {
            return false;
        }

        const injuredSpecies = classifiers.animalSpecies.options.find((option) => option.id === permitType.speciesId);
        if (!injuredSpecies) {
            return false;
        }

        const isInjuredTypeIdAllowed =
            permit.huntedTypeId !== HuntedTypeId.Injured &&
            !configuration.hunt.notValidForInjuredSpecies.includes(injuredSpecies?.id);

        if (!isInjuredTypeIdAllowed && option.id === HuntedTypeId.Injured) {
            return false;
        }

        return true;
    });

    let typeId: number;

    if (selectedType && types.some((type) => type.id === Number(selectedType))) {
        typeId = Number(selectedType);
    } else {
        typeId = HuntedTypeId.Hunted;
    }

    const permitAllowancesForType = classifiers.permitAllowances.options.filter((option) => {
        if (!isOptionActive(option)) {
            return false;
        }

        if (option.permitTypeId !== permit.permitTypeId) {
            return false;
        }

        if (typeId === HuntedTypeId.Hunted && !option.isValidForKilled) {
            return false;
        }

        return true;
    });

    const defaultPermitAllowanceForType =
        permitAllowancesForType.find((option) => option.isDefault) ?? permitAllowancesForType[0];

    if (!defaultPermitAllowanceForType) {
        throw new Error(`Default permit allowance not found for type ${typeId}`);
    }

    const genderIds = new Set<number>();
    for (const permitAllowance of permitAllowancesForType) {
        genderIds.add(permitAllowance.genderId);
    }

    const genders = classifiers.genders.options.filter((option) => {
        if (!isOptionActive(option)) {
            return false;
        }

        if (!genderIds.has(option.id)) {
            return false;
        }

        return true;
    });

    let genderId: number;

    if (genderIds.has(Number(selectedGender))) {
        genderId = Number(selectedGender);
    } else {
        genderId = defaultPermitAllowanceForType.genderId;
    }

    const permitAllowancesForGender = permitAllowancesForType.filter((option) => option.genderId === genderId);

    const defaultPermitAllowanceForGender =
        permitAllowancesForGender.find((option) => option.isDefault) ?? permitAllowancesForGender[0];

    if (!defaultPermitAllowanceForGender) {
        throw new Error(`Default permit allowance not found for type ${typeId} and gender ${genderId}`);
    }

    const ageIds = new Set<number>();
    for (const permitAllowance of permitAllowancesForGender) {
        ageIds.add(permitAllowance.ageId);
    }

    const ages = classifiers.ages.options.filter((option) => {
        if (!isOptionActive(option)) {
            return false;
        }

        if (!ageIds.has(option.id)) {
            return false;
        }

        return true;
    });

    let ageId: number;

    if (ageIds.has(Number(selectedAge))) {
        ageId = Number(selectedAge);
    } else {
        ageId = defaultPermitAllowanceForGender.ageId;
    }

    return {
        types,
        typeId,
        genders,
        genderId,
        ages,
        ageId,
    };
}
