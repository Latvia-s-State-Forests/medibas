import { differenceInDays } from "date-fns";
import { HuntedTypeId } from "~/types/classifiers";
import { Permit, StrapStatusId } from "~/types/permits";

export function isInjuredAnimalPermit(permit: Permit, districtId: number) {
    if (permit.strapStatusId !== StrapStatusId.Used) {
        return false;
    }

    if (!permit.isReportEditingEnabled) {
        return false;
    }

    if (permit.huntedTypeId !== HuntedTypeId.Injured) {
        return false;
    }

    if (!permit.injuredDate) {
        return false;
    }

    const dateDifference = differenceInDays(new Date(permit.injuredDate), new Date());
    if (Math.abs(dateDifference) > 14) {
        return false;
    }

    if (!permit.huntingDistrictIds.includes(districtId)) {
        return false;
    }

    return true;
}

export function getInjuredAnimalPermits(permits: Permit[], districtId: number) {
    return permits.filter((permit) => isInjuredAnimalPermit(permit, districtId));
}
