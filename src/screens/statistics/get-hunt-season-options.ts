import { IndividualHuntStatisticsItem, StatisticsSpeciesItem, DrivenHuntStatisticsItem } from "~/types/statistics";

export function getHuntSeasonOptions(
    statisticsData: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem | StatisticsSpeciesItem>
): Array<{ label: string; value: string }> {
    // Get all huntSeason values
    const seasons = statisticsData?.map((item) => item.huntSeason) || [];
    // Filter for unique values
    const uniqueSeasons = Array.from(new Set(seasons));
    // Map to label/value objects
    return uniqueSeasons.map((season: string) => ({
        label: season,
        value: season,
    }));
}
