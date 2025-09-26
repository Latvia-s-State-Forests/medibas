import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacer } from "~/components/spacer";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useHuntSeasonStatistics } from "~/hooks/use-hunt-season-statistics";
import { useSpeciesContext } from "~/hooks/use-species";
import { getAppLanguage } from "~/i18n";
import {
    groupBirdSpeciesStatistics,
    groupLimitedSpeciesStatistics,
    groupUnlimitedWithLimitedUnlimited,
} from "~/screens/statistics/species/species-statistics-group-by-type";
import { SpeciesStatisticsGroups } from "~/screens/statistics/species/species-statistics-groups";
import { StatisticsSpeciesItem } from "~/types/statistics";
import {
    filterBirdSpeciesData,
    filterLimitedSpeciesData,
    filterUnlimitedSpeciesData,
} from "./filter-statistic-species";

type SpeciesStatisticsScreenLoadedProps = {
    statistics: StatisticsSpeciesItem[];
};

export function SpeciesStatisticsScreenLoaded(props: SpeciesStatisticsScreenLoadedProps) {
    const insets = useSafeAreaInsets();
    const classifiers = useClassifiers();
    const language = getAppLanguage();
    const { limitedSpecies, unlimitedSpecies, limitedUnlimitedSpecies } = useSpeciesContext();

    const { huntSeasonOptions, selectedSeason, setSelectedSeason, selectedSeasonHunts } = useHuntSeasonStatistics(
        props.statistics
    );

    const selectedSeasonSpecies = selectedSeasonHunts as StatisticsSpeciesItem[];

    const limitedSpeciesData = filterLimitedSpeciesData(selectedSeasonSpecies, limitedSpecies);
    const birdSpeciesData = filterBirdSpeciesData(selectedSeasonSpecies, classifiers);
    const unlimitedWithLimitedUnlimitedSpeciesData = filterUnlimitedSpeciesData(
        selectedSeasonSpecies,
        unlimitedSpecies,
        limitedUnlimitedSpecies
    );

    // Combine unlimited and limitedUnlimited species for grouping
    const allUnlimitedSpecies = React.useMemo(() => {
        return [...unlimitedSpecies, ...limitedUnlimitedSpecies];
    }, [unlimitedSpecies, limitedUnlimitedSpecies]);

    // Group limited species by speciesId and permitTypeId, then count them
    const limitedSpeciesGroups = React.useMemo(() => {
        return groupLimitedSpeciesStatistics(limitedSpeciesData, limitedSpecies, language);
    }, [limitedSpeciesData, limitedSpecies, language]);

    const unlimitedWithLimitedUnlimitedGroups = React.useMemo(() => {
        return groupUnlimitedWithLimitedUnlimited(
            unlimitedWithLimitedUnlimitedSpeciesData,
            allUnlimitedSpecies,
            limitedUnlimitedSpecies,
            language
        );
    }, [unlimitedWithLimitedUnlimitedSpeciesData, allUnlimitedSpecies, limitedUnlimitedSpecies, language]);

    const birdSpeciesGroups = React.useMemo(() => {
        return groupBirdSpeciesStatistics(birdSpeciesData, classifiers, language);
    }, [birdSpeciesData, classifiers, language]);

    return (
        <ScrollView
            contentContainerStyle={[
                styles.scrollContent,
                {
                    paddingRight: insets.right + 16,
                    paddingLeft: insets.left + 16,
                    paddingBottom: insets.bottom + 24,
                },
            ]}
        >
            <Spacer size={24} />
            <SpeciesStatisticsGroups
                huntSeasonOptions={huntSeasonOptions}
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
                limitedSpeciesGroups={limitedSpeciesGroups}
                unlimitedWithLimitedUnlimitedGroups={unlimitedWithLimitedUnlimitedGroups}
                birdSpeciesGroups={birdSpeciesGroups}
                limitedUnlimitedSpecies={limitedUnlimitedSpecies}
                summaryRowContainerStyle={styles.summaryRowContainer}
            />
            <Spacer size={24} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    summaryRowContainer: {
        gap: 8,
    },
});
