import { i18n } from "~/i18n";
import { HuntPlace } from "~/types/hunts";
import { IndividualHuntFormState } from "./individual-hunt-form";

function getErrorMessage(fieldName: string): string {
    return `"${fieldName}" ${i18n.t("validation.requiredField")}`;
}

export function getSubmitIndividualHuntValidationErrors({
    plannedFromDate,
    plannedToDate,
    selectedPosition,
    district,
    huntPlace,
    propertyName,
    selectedSpeciesList,
    selectedSpeciesWithEquipmentList,
    hasEquipment,
    huntAllSpecies,
}: IndividualHuntFormState & { huntPlace: HuntPlace; hasEquipment: boolean }): string[] {
    const errors: string[] = [];

    if (huntPlace === HuntPlace.InTheStation && !district) {
        errors.push(getErrorMessage(i18n.t("hunt.individualHunt.huntingDistrict")));
    }

    if (huntPlace === HuntPlace.WaterBody && !propertyName) {
        errors.push(getErrorMessage(i18n.t("hunt.individualHunt.waterBodyName")));
    }

    if (!plannedFromDate) {
        errors.push(getErrorMessage(i18n.t("hunt.individualHunt.date.startDate")));
    }

    if (plannedFromDate && !plannedToDate) {
        errors.push(getErrorMessage(i18n.t("hunt.individualHunt.date.endDate")));
    }

    if (!selectedPosition) {
        errors.push(getErrorMessage(i18n.t("hunt.individualHunt.huntPlace")));
    }

    // Skip species validation if hunting all species in station
    const huntAllSpeciesToggled = huntPlace === HuntPlace.InTheStation && huntAllSpecies;

    if (
        huntPlace !== HuntPlace.WaterBody &&
        !huntAllSpeciesToggled &&
        !hasEquipment &&
        selectedSpeciesList.length === 0
    ) {
        errors.push(getErrorMessage(i18n.t("hunt.individualHunt.huntingSpecies")));
    }

    if (
        huntPlace !== HuntPlace.WaterBody &&
        !huntAllSpeciesToggled &&
        hasEquipment &&
        selectedSpeciesWithEquipmentList.length === 0
    ) {
        errors.push(getErrorMessage(i18n.t("hunt.individualHunt.huntingSpecies")));
    }

    return errors;
}
