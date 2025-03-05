import { i18n } from "~/i18n";
import { AgeId, GenderId, HuntedTypeId } from "~/types/classifiers";
import { UnlimitedPreyState } from "~/types/hunt";
import { LimitedPreyState } from "~/types/hunt";
import { UnlimitedSpecies } from "~/types/hunt";
import { Permit } from "~/types/permits";

function getErrorMessage(fieldName: string): string {
    return `"${fieldName}" ${i18n.t("validation.requiredField")}`;
}

export function getLimitedPreyValidationErrors(limitedPrey: LimitedPreyState): string[] {
    const errors: string[] = [];
    const { position, type, gender, age, photo, isHunterForeigner, foreignerPermitNumber } = limitedPrey;
    if (!position) {
        errors.push(getErrorMessage(i18n.t("hunt.position")));
    }

    if (isHunterForeigner && !foreignerPermitNumber) {
        errors.push(getErrorMessage(i18n.t("hunt.enterHunterCardNumber")));
    }

    if (!type) {
        errors.push(getErrorMessage(i18n.t("hunt.type")));
    }

    if (!gender) {
        errors.push(getErrorMessage(i18n.t("hunt.gender")));
    }

    if (!age) {
        errors.push(getErrorMessage(i18n.t("hunt.age")));
    }

    if (type !== String(HuntedTypeId.Injured) && !photo) {
        errors.push(getErrorMessage(i18n.t("damage.photo")));
    }

    return errors;
}

export function getUnlimitedPreyValidationErrors(
    unlimitedPrey: UnlimitedPreyState,
    unlimitedSpeciesContext?: UnlimitedSpecies
): string[] {
    const errors: string[] = [];
    const { position, subspecies, photo } = unlimitedPrey;
    if (!position) {
        errors.push(getErrorMessage(i18n.t("hunt.position")));
    }

    if (unlimitedSpeciesContext?.subspecies && !subspecies) {
        errors.push(getErrorMessage(i18n.t("hunt.species")));
    }

    if (!photo) {
        errors.push(getErrorMessage(i18n.t("damage.photo")));
    }

    return errors;
}

export function getLimitedPreyValidationWarnings(
    inAfricanSwineFeverZone: boolean,
    outOfDistrictWarning: boolean,
    limitedPrey: LimitedPreyState,
    permitType: number | undefined = undefined,
    permit: Permit
): string[] {
    const warnings: string[] = [];
    const { gender, age } = limitedPrey;
    const roeDeerMale = 8;
    const roeDeerFemaleJuvenile = 9;

    if (inAfricanSwineFeverZone) {
        warnings.push(i18n.t("hunt.africanSwineFeverWarning"));
    }

    if (outOfDistrictWarning) {
        warnings.push(i18n.t("hunt.outOfDistrictWarning"));
    }

    if (
        gender === String(GenderId.Female) &&
        age !== String(AgeId.LessThanOneYear) &&
        permitType === roeDeerMale &&
        permit.huntedTypeId !== HuntedTypeId.Injured
    ) {
        warnings.push(i18n.t("hunt.deerValidationMessage"));
    }

    if (
        gender === String(GenderId.Male) &&
        age !== String(AgeId.LessThanOneYear) &&
        permitType === roeDeerFemaleJuvenile &&
        permit.huntedTypeId !== HuntedTypeId.Injured
    ) {
        warnings.push(i18n.t("hunt.deerValidationMessage"));
    }

    return warnings;
}
