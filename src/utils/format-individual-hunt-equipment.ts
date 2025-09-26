import { Equipment } from "~/screens/hunt/individual-hunt/individual-hunt-form";
import { Hunt } from "~/types/hunts";
import { IndividualHuntStatisticsItem } from "~/types/statistics";

type HuntWithEquipment = Hunt | IndividualHuntStatisticsItem;

export const EQUIPMENT_CONFIG = {
    isNightVisionUsed: {
        key: "nightVision",
        translation: "hunt.equipment.nightVision",
    },
    isSemiAutomaticWeaponUsed: {
        key: "semiAutomatic",
        translation: "hunt.equipment.semiAutomatic",
    },
    isLightSourceUsed: {
        key: "lightSource",
        translation: "hunt.equipment.lightSource",
    },
    isThermalScopeUsed: {
        key: "thermalScope",
        translation: "hunt.equipment.thermalScope",
    },
} as const;

/**
 * Gets equipment data from hunt object
 * @param hunt - Hunt or statistics item containing equipment information
 * @param useTranslation - Whether to return translated strings or equipment keys
 * @param t - Translation function (required when useTranslation is true)
 * @returns Array of equipment data
 */
export function getEquipmentData(
    hunt: HuntWithEquipment,
    useTranslation: boolean = false,
    t?: (key: string) => string
): Array<Equipment | string> {
    const equipmentData: Array<Equipment | string> = [];

    for (const [huntKey, config] of Object.entries(EQUIPMENT_CONFIG)) {
        if (hunt[huntKey as keyof HuntWithEquipment]) {
            equipmentData.push(useTranslation && t ? t(config.translation) : config.key);
        }
    }

    return equipmentData;
}

/**
 * Gets translated equipment names as a comma-separated string
 * @param hunt - Hunt or statistics item containing equipment information
 * @param t - Translation function
 * @returns Comma-separated string of translated equipment names
 */
export function getEquipmentTranslations(hunt: HuntWithEquipment, t: (key: string) => string): string {
    return getEquipmentData(hunt, true, t).join(", ");
}
