import { Permit, StrapStatusId } from "~/types/permits";

export function isPermitValid(permit: Permit, districtId: number) {
    if (permit.strapStatusId !== StrapStatusId.Unused) {
        return false;
    }

    if (!permit.isReportEditingEnabled) {
        return false;
    }

    const currentDate = new Date();
    if (permit.validFrom && new Date(permit.validFrom) > currentDate) {
        return false;
    }

    if (permit.validTo && new Date(permit.validTo) < currentDate) {
        return false;
    }

    if (!permit.huntingDistrictIds.includes(districtId)) {
        return false;
    }

    return true;
}

export function getValidPermits(permits: Permit[], districtId: number) {
    return permits.filter((permit) => isPermitValid(permit, districtId));
}
