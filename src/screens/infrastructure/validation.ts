import { i18n } from "~/i18n";

function getErrorMessage(fieldName: string): string {
    return `"${fieldName}" ${i18n.t("validation.requiredField")}`;
}

export function getSubmitInfrastructureValidationErrors(
    selectedPosition: { x: number; y: number },
    infrastructureType: number,
    districtId: number
) {
    const errors: string[] = [];

    if (selectedPosition.x === 0 || selectedPosition.y === 0) {
        errors.push(getErrorMessage(i18n.t("mtl.infrastructure.location")));
    }

    if (!districtId) {
        errors.push(getErrorMessage(i18n.t("mtl.infrastructure.district")));
    }

    if (!infrastructureType) {
        errors.push(getErrorMessage(i18n.t("mtl.infrastructure.type")));
    }

    return errors;
}
