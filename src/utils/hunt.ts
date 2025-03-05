import { configuration } from "~/configuration";
import { SpeciesId } from "~/types/classifiers";

export function isSpeciesValidForInjured(speciesId: SpeciesId) {
    return configuration.hunt.notValidForInjuredSpecies.filter((species) => species === speciesId).length === 0;
}
