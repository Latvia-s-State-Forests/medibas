import { i18n } from "~/i18n";
import { Hunt, HuntEventStatus } from "~/types/hunts";
import { DrivenHuntFormState } from "./driven-hunt-form-state";

function getErrorMessage(fieldName: string): string {
    return `"${fieldName}" ${i18n.t("validation.requiredField")}`;
}

export function getDrivenHuntManagementErrors({
    huntEventStatusId,
    huntManagerPersonId,
    targetSpecies,
    hasTargetSpecies,
    hunters,
    beaters,
    guestHunters,
    districts,
    plannedFrom,
}: Hunt): string[] {
    const errors: string[] = [];

    if (huntEventStatusId !== HuntEventStatus.Scheduled) {
        return errors;
    }

    if (districts && districts.length === 0) {
        errors.push(getErrorMessage(i18n.t("hunt.drivenHunt.district")));
    }

    if (!huntManagerPersonId) {
        errors.push(getErrorMessage(i18n.t("hunt.drivenHunt.huntManager")));
    }

    if (targetSpecies && targetSpecies.length === 0 && hasTargetSpecies === true) {
        errors.push(getErrorMessage(i18n.t("hunt.drivenHunt.speciesToHuntList")));
    }

    if (hunters && beaters) {
        const totalHunters = hunters.length + guestHunters.length;
        const totalBeaters = beaters.length;
        const totalMembers = totalHunters + totalBeaters;

        if (totalMembers < 2) {
            errors.push(i18n.t("hunt.drivenHunt.membersListValidation"));
        }
        // When there are enough total members but no hunters
        else if (totalBeaters >= 2 && totalHunters < 1) {
            errors.push(
                `"${i18n.t("hunt.drivenHunt.detailScreen.hunters")}" ${i18n.t("hunt.drivenHunt.huntersListValidation")}`
            );
        }
    }

    const isHuntScheduledToday = new Date(plannedFrom).toDateString() === new Date().toDateString();
    if (!isHuntScheduledToday) {
        errors.push(i18n.t("hunt.drivenHunt.huntIsNotScheduledToday"));
    }

    return errors;
}

export function getSubmitDrivenHuntValidationErrors({
    districts,
    date,
    hunters = [],
    beaters = [],
}: DrivenHuntFormState): string[] {
    const errors: string[] = [];

    if (districts.length === 0) {
        errors.push(getErrorMessage(i18n.t("hunt.drivenHunt.district")));
    }

    if (!date) {
        errors.push(getErrorMessage(i18n.t("dateInput.date")));
    }

    // Validation: hunter is also in beaters list
    if (hunters.length > 0 && beaters.length > 0) {
        const hunterPersonIds = hunters.map((hunter) => hunter.personId);
        const duplicateBeaters = beaters.filter(
            (beater) => beater.hunterPersonId && hunterPersonIds.includes(beater.hunterPersonId)
        );
        if (duplicateBeaters.length > 0) {
            duplicateBeaters.forEach((beater) => {
                errors.push(i18n.t("hunt.drivenHunt.hunterInBothLists", { memberName: beater.fullName }));
            });
        }
    }

    return errors;
}
