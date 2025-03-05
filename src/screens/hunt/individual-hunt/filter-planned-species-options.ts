import { configuration } from "~/configuration";
import { HuntPlace } from "~/types/hunts";
import { PlannedSpeciesOption } from "../get-planned-species-options";

export function filterPlannedSpeciesOptions(
    plannedSpeciesOptions: PlannedSpeciesOption[],
    huntPlace: HuntPlace,
    isWithEquipment: boolean
): PlannedSpeciesOption[] {
    return plannedSpeciesOptions.filter((plannedSpeciesOptions) => {
        if (huntPlace === HuntPlace.WaterBody) {
            return configuration.hunt.plannedSpeciesNearWaters.includes(plannedSpeciesOptions.value.speciesId);
        }
        if (huntPlace === HuntPlace.OutSideStation) {
            if (isWithEquipment) {
                return (
                    configuration.hunt.plannedSpeciesOutsideDistrict.includes(plannedSpeciesOptions.value.speciesId) &&
                    configuration.hunt.plannedSpeciesUsingEquipment.includes(plannedSpeciesOptions.value.speciesId)
                );
            }
            return configuration.hunt.plannedSpeciesOutsideDistrict.includes(plannedSpeciesOptions.value.speciesId);
        }
        if (isWithEquipment) {
            return configuration.hunt.plannedSpeciesUsingEquipment.includes(plannedSpeciesOptions.value.speciesId);
        }
        return true;
    });
}
