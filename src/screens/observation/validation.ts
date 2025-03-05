import { configuration } from "~/configuration";
import { i18n } from "~/i18n";
import { ObservationTypeId, ObservedSignsId, SpeciesId } from "~/types/classifiers";
import { AnimalsState, ObservationsState } from "~/types/observations";
import { DeadAnimalsState } from "~/types/observations";
import { SignsOfPresenceState } from "~/types/observations";

function getErrorMessage(fieldName: string): string {
    return `"${fieldName}" ${i18n.t("validation.requiredField")}`;
}

export function getAnimalsValidationErrors(animals: AnimalsState): string[] {
    const errors: string[] = [];
    let signsOfDiseaseErrorAdded = false;

    for (const { gender, age, count, observedSignsOfDisease, signsOfDisease } of animals) {
        if (!gender) {
            errors.push(getErrorMessage(i18n.t("observations.gender")));
        }

        if (!age) {
            errors.push(getErrorMessage(i18n.t("observations.age")));
        }

        if (count < 1) {
            errors.push(getErrorMessage(i18n.t("observations.count")));
        }

        if (observedSignsOfDisease) {
            if (Object.values(signsOfDisease).every((disease) => !disease) && !signsOfDiseaseErrorAdded) {
                errors.push(getErrorMessage(i18n.t("observations.signsOfDisease")));
                signsOfDiseaseErrorAdded = true;
            }
        }
    }

    return errors;
}

export function getSignsOfPresenceValidationErrors(signsOfPresence: SignsOfPresenceState): string[] {
    const errors: string[] = [];

    if (Object.values(signsOfPresence.observedSigns).every((disease) => !disease)) {
        errors.push(getErrorMessage(i18n.t("observations.observedSigns")));
    }

    if (signsOfPresence.observedSigns[ObservedSignsId.Other] && !signsOfPresence.observedSignsNotes) {
        errors.push(getErrorMessage(i18n.t("observations.observedSignsNotes")));
    }

    if (signsOfPresence.count < 1) {
        errors.push(getErrorMessage(i18n.t("observations.count")));
    }

    return errors;
}

export function getDeadAnimalsValidationErrors(deadAnimals: DeadAnimalsState): string[] {
    const errors: string[] = [];
    if (!deadAnimals.gender) {
        errors.push(getErrorMessage(i18n.t("observations.gender")));
    }

    if (!deadAnimals.deathType) {
        errors.push(getErrorMessage(i18n.t("observations.deathType")));
    }

    if (!deadAnimals.age) {
        errors.push(getErrorMessage(i18n.t("observations.age")));
    }

    if (!deadAnimals.count) {
        errors.push(getErrorMessage(i18n.t("observations.count")));
    }
    if (deadAnimals.observedSignsOfDisease) {
        if (Object.values(deadAnimals.signsOfDisease).every((disease) => !disease)) {
            errors.push(getErrorMessage(i18n.t("observations.observedSigns")));
        }
    }

    return errors;
}

export function getObservationsValidationErrors(observations: ObservationsState): string[] {
    const errors: string[] = [];

    if (observations.huntEventId) {
        if (observations.huntEventArea === undefined) {
            errors.push(getErrorMessage(i18n.t("hunt.drivenHunt.mastArea")));
        } else if (observations.huntEventArea < configuration.observations.mastArea.min) {
            errors.push(
                i18n.t("validation.lessThanMinValue", {
                    fieldName: i18n.t("hunt.drivenHunt.mastArea"),
                    minValue: configuration.observations.mastArea.min,
                })
            );
        } else if (observations.huntEventArea > configuration.observations.mastArea.max) {
            errors.push(
                i18n.t("validation.greaterThanMaxValue", {
                    fieldName: i18n.t("hunt.drivenHunt.mastArea"),
                    maxValue: configuration.observations.mastArea.max,
                })
            );
        }
    }

    if (!observations.position) {
        errors.push(getErrorMessage(i18n.t("observations.position")));
    }

    if (!observations.type) {
        errors.push(getErrorMessage(i18n.t("observations.type")));
    }

    if (!observations.species) {
        errors.push(getErrorMessage(i18n.t("observations.speciesMainGroup")));
    }

    if (observations.species === SpeciesId.OtherMammals && !observations.otherMammals) {
        errors.push(getErrorMessage(i18n.t("observations.otherMammals")));
    }

    if (observations.species === SpeciesId.Birds && !observations.birds) {
        errors.push(getErrorMessage(i18n.t("observations.birds")));
    }

    if (observations.type === ObservationTypeId.DirectlyObservedAnimals) {
        errors.push(...getAnimalsValidationErrors(observations.animals));
    }

    if (observations.type === ObservationTypeId.SignsOfPresence) {
        errors.push(...getSignsOfPresenceValidationErrors(observations.signsOfPresence));
    }

    if (observations.type === ObservationTypeId.Dead) {
        errors.push(...getDeadAnimalsValidationErrors(observations.deadAnimals));
    }

    //Photo is optional for ObservationType.DirectlyObservedAnimals, mandatory for others
    if (!observations.photo && observations.type !== ObservationTypeId.DirectlyObservedAnimals) {
        errors.push(getErrorMessage(i18n.t("observations.photo")));
    }

    return errors;
}
