import { HuntedTypeId } from "~/types/classifiers";

type HuntedAnimals = {
    speciesId: number;
    strapNumber?: string;
    huntedTypeId?: number;
};

export function getFilteredHuntedSpecies(
    huntedAnimals: HuntedAnimals[],
    speciesById: Map<number, string>,
    typeId?: HuntedTypeId | null
): string[] {
    return huntedAnimals
        .filter((animal) => (typeId === null ? !animal.huntedTypeId : animal.huntedTypeId === typeId))
        .map((animal) => {
            const species = speciesById.get(animal.speciesId);
            return species && animal.strapNumber ? `${species} (${animal.strapNumber})` : species;
        })
        .filter((item): item is string => Boolean(item));
}
