import * as React from "react";
import { useTranslation } from "react-i18next";
import { getHuntSeasonOptions } from "~/screens/statistics/get-hunt-season-options";
import { groupHuntsByPlace } from "~/screens/statistics/group-hunts-by-place";
import { IndividualHuntStatisticsItem, StatisticsSpeciesItem, DrivenHuntStatisticsItem } from "~/types/statistics";

export function useHuntSeasonStatistics(
    statistics: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem | StatisticsSpeciesItem>
) {
    const { t } = useTranslation();

    const huntSeasonOptions = React.useMemo(() => {
        return getHuntSeasonOptions(statistics);
    }, [statistics]);

    const [selectedSeason, setSelectedSeason] = React.useState("");

    // Update selectedSeason when huntSeasonOptions changes (when data loads)
    React.useEffect(() => {
        if (huntSeasonOptions.length > 0 && !selectedSeason) {
            setSelectedSeason(huntSeasonOptions[huntSeasonOptions.length - 1].value);
        }
    }, [huntSeasonOptions, selectedSeason]);

    const selectedSeasonHunts = React.useMemo(() => {
        return statistics.filter((hunt) => hunt.huntSeason === selectedSeason);
    }, [statistics, selectedSeason]);

    // Only use groupHuntsByPlace for hunt statistics (not species statistics)
    const huntsByPlace = React.useMemo(() => {
        // Check if we have hunt statistics (not species statistics)
        const huntStatistics = selectedSeasonHunts.filter(
            (item): item is IndividualHuntStatisticsItem | DrivenHuntStatisticsItem => "huntEventId" in item
        );

        // Only call groupHuntsByPlace if we have actual hunt statistics
        if (huntStatistics.length > 0) {
            return groupHuntsByPlace(huntStatistics, t);
        }

        return [];
    }, [selectedSeasonHunts, t]);

    return {
        huntSeasonOptions,
        selectedSeason,
        setSelectedSeason,
        selectedSeasonHunts,
        huntsByPlace,
    };
}
