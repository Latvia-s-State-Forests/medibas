import { AgriculturalLandTypeId, AgriculturalLandTypeClassifierOption } from "~/types/classifiers";

export function isLandDamageAreaVisible(
    type: AgriculturalLandTypeId,
    subtype: AgriculturalLandTypeId,
    typeClassifierOptions: AgriculturalLandTypeClassifierOption[]
): boolean {
    let isAreaVisible = false;

    const selectedType = type === AgriculturalLandTypeId.Other ? subtype : type;
    if (selectedType) {
        const selectedTypeClassifier = typeClassifierOptions.find((option) => option.id === selectedType);
        if (!selectedTypeClassifier?.isCountable) {
            isAreaVisible = true;
        }
    }

    return isAreaVisible;
}
