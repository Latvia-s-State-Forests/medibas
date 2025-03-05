import { Equipment } from "~/screens/hunt/individual-hunt/individual-hunt-form";

export function hasEquipment(equipmentList: Equipment[], equipmentType: Equipment): boolean {
    return equipmentList.includes(equipmentType);
}

export function getEquipmentStatus(equipmentList: Equipment[]) {
    return {
        isNightVision: hasEquipment(equipmentList, "nightVision"),
        isSemiAutomatic: hasEquipment(equipmentList, "semiAutomatic"),
        isLightSourceUsed: hasEquipment(equipmentList, "lightSource"),
        isThermalScopeUsed: hasEquipment(equipmentList, "thermalScope"),
    };
}
