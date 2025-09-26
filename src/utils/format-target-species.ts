import { AppLanguage, DEFAULT_APP_LANGUAGE } from "~/i18n";
import { Classifiers } from "~/types/classifiers";

type TargetSpeciesItem = {
    speciesId: number;
    permitTypeId?: number;
};

/**
 * Formats target species information into a readable string array
 * @param targetSpecies - Array of target species
 * @param classifiers - Classifiers containing species and permit type information
 * @param language - Current app language
 * @returns Array of formatted target species names
 */
export function formatTargetSpecies(
    targetSpecies: TargetSpeciesItem[],
    classifiers: Classifiers,
    language: AppLanguage
): string[] {
    const speciesById = new Map<number, string>();
    for (const species of classifiers.animalSpecies.options) {
        speciesById.set(species.id, species.description[language] ?? species.description[DEFAULT_APP_LANGUAGE] ?? "??");
    }

    const permitTypesById = new Map<number, string>();
    for (const permitType of classifiers.permitTypes.options) {
        permitTypesById.set(
            permitType.id,
            permitType.description[language] ?? permitType.description[DEFAULT_APP_LANGUAGE] ?? "??"
        );
    }

    const result: string[] = [];
    for (const targetSpeciesItem of targetSpecies) {
        if (targetSpeciesItem.permitTypeId) {
            const permitType = permitTypesById.get(targetSpeciesItem.permitTypeId);
            if (permitType) {
                result.push(permitType);
            }
        } else {
            const species = speciesById.get(targetSpeciesItem.speciesId);
            if (species) {
                result.push(species);
            }
        }
    }

    result.sort((a, b) => a.localeCompare(b));
    return result;
}
