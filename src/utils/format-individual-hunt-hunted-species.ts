import { AppLanguage } from "~/i18n";
import { getPlannedSpeciesOptions } from "~/screens/hunt/get-planned-species-options";
import { Classifiers } from "~/types/classifiers";
import { Hunt } from "~/types/hunts";
import { IndividualHuntStatisticsItem } from "~/types/statistics";

type HuntWithTargetSpecies = Hunt | IndividualHuntStatisticsItem;

/**
 * Formats hunted species information into a readable string
 * @param targetSpecies - Array of target species from hunt or statistics
 * @param classifiers - Classifiers containing species information
 * @param language - Current app language
 * @returns Formatted string of hunted species
 */
export function formatIndividualHuntHuntedSpecies(
    targetSpecies: HuntWithTargetSpecies["targetSpecies"],
    classifiers: Classifiers,
    language: AppLanguage
): string {
    const allSpecies = getPlannedSpeciesOptions(classifiers, language);

    return allSpecies
        .filter((species) => {
            return targetSpecies?.some(
                (s) => s.speciesId === species.value.speciesId && s.permitTypeId === species.value.permitTypeId
            );
        })
        .map((species) => species.label)
        .join(", ");
}
