import { AgriculturalLandTypeId, AgriculturalLandTypeClassifierOption } from "~/types/classifiers";

export function isLandDamageCountVisible(
    type: AgriculturalLandTypeId,
    subtype: AgriculturalLandTypeId,
    typeClassifierOptions: AgriculturalLandTypeClassifierOption[]
): boolean {
    let isCountVisible = false;

    const selectedType = type === AgriculturalLandTypeId.Other ? subtype : type;
    if (selectedType) {
        const selectedTypeClassifier = typeClassifierOptions.find((option) => option.id === selectedType);
        if (selectedTypeClassifier?.isCountable) {
            isCountVisible = true;
        }
    }

    return isCountVisible;
}
