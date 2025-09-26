import { Classifiers, SpeciesId } from "~/types/classifiers";
import { LimitedSpecies, UnlimitedSpecies } from "~/types/hunt";
import { StatisticsSpeciesItem } from "~/types/statistics";

function filterStatisticsBySpeciesIds(
    statisticsData: StatisticsSpeciesItem[],
    speciesIds: Set<number>
): StatisticsSpeciesItem[] {
    return statisticsData?.filter((item) => speciesIds.has(item.speciesId)) || [];
}

export function filterLimitedSpeciesData(
    statisticsData: StatisticsSpeciesItem[],
    limitedSpecies: LimitedSpecies[]
): StatisticsSpeciesItem[] {
    const speciesIds = new Set(limitedSpecies.map((s) => s.id));
    return filterStatisticsBySpeciesIds(statisticsData, speciesIds);
}

export function filterBirdSpeciesData(
    statisticsData: StatisticsSpeciesItem[],
    classifiers: Classifiers | undefined
): StatisticsSpeciesItem[] {
    return (
        statisticsData?.filter((item) => {
            // Only include birds (PUTNI animalSpecies.options.subspeciesOfId === 31)
            const speciesInfo = classifiers?.animalSpecies.options.find((species) => species.id === item.speciesId);
            return speciesInfo?.subspeciesOfId === SpeciesId.Birds;
        }) || []
    );
}

export function filterUnlimitedSpeciesData(
    statisticsData: StatisticsSpeciesItem[],
    unlimitedSpecies: UnlimitedSpecies[],
    limitedUnlimitedSpecies: Array<UnlimitedSpecies | LimitedSpecies>
): StatisticsSpeciesItem[] {
    const allSpeciesIds = new Set([...unlimitedSpecies.map((s) => s.id), ...limitedUnlimitedSpecies.map((s) => s.id)]);
    return filterStatisticsBySpeciesIds(statisticsData, allSpeciesIds);
}

export function filterStatisticsBySeason(
    statisticsData: StatisticsSpeciesItem[],
    selectedSeason: string
): StatisticsSpeciesItem[] {
    return statisticsData?.filter((item) => item.huntSeason === selectedSeason) || [];
}
