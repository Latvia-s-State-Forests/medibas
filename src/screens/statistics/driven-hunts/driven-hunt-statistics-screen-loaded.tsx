import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReadOnlyField } from "~/components/read-only-field";
import { SegmentedControl } from "~/components/segmented-control";
import { Spacer } from "~/components/spacer";
import { useHuntSeasonStatistics } from "~/hooks/use-hunt-season-statistics";
import { DrivenHuntStatisticsItem } from "~/types/statistics";
import { HuntPlaceSectionStatistics } from "../hunt-place-section-statistics";

type DrivenHuntStatisticsScreenLoadedProps = {
    statistics: DrivenHuntStatisticsItem[];
};

export function DrivenHuntStatisticsScreenLoaded(props: DrivenHuntStatisticsScreenLoadedProps) {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const { huntSeasonOptions, selectedSeason, setSelectedSeason, huntsByPlace } = useHuntSeasonStatistics(
        props.statistics
    );

    return (
        <ScrollView
            contentContainerStyle={[
                {
                    paddingRight: insets.right + 16,
                    paddingLeft: insets.left + 16,
                    paddingBottom: insets.bottom + 24,
                },
            ]}
        >
            <Spacer size={24} />
            {huntSeasonOptions.length > 1 ? (
                <>
                    <SegmentedControl
                        label={t("statistics.huntSeason")}
                        options={huntSeasonOptions}
                        value={selectedSeason}
                        onChange={setSelectedSeason}
                    />
                    <Spacer size={24} />
                </>
            ) : (
                <ReadOnlyField label={t("statistics.huntSeason")} value={selectedSeason} />
            )}
            <View style={styles.statisticsSection}>
                {huntsByPlace.map((huntPlace) => {
                    return (
                        <View key={huntPlace.placeId}>
                            <HuntPlaceSectionStatistics
                                huntPlace={huntPlace}
                                selectedSeason={selectedSeason}
                                huntType="driven"
                            />
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    statisticsSection: {
        gap: 32,
    },
});
