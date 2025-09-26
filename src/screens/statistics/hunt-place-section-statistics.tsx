import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { formatHuntStatistics } from "~/screens/statistics/format-hunt-statistics";
import { formatTimeSpent } from "~/screens/statistics/format-time-spent";
import { IndividualHuntStatisticsItem, DrivenHuntStatisticsItem } from "~/types/statistics";
import { StatisticsHuntInfoCard } from "./statistics-hunt-info-card";

type HuntPlaceData = {
    placeId: number;
    name: string;
    totalTime: number;
    count: number;
    huntsWithAnimals: number;
    huntsWithoutAnimals: number;
    allHunts: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
    huntsWithAnimalsData: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
    huntsWithoutAnimalsData: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>;
};

type HuntPlaceSectionStatisticsProps = {
    huntPlace: HuntPlaceData;
    selectedSeason: string;
    huntType: "individual" | "driven";
};

export function HuntPlaceSectionStatistics(props: HuntPlaceSectionStatisticsProps) {
    const { t } = useTranslation();
    const navigation = useNavigation();

    function onNavigating(
        hunts: Array<IndividualHuntStatisticsItem | DrivenHuntStatisticsItem>,
        filterType: "all" | "withAnimals" | "withoutAnimals"
    ) {
        if (hunts.length === 0) {
            return;
        }

        // Use the provided hunt type
        const huntType = props.huntType;

        if (hunts.length === 1) {
            // Navigate directly to detail screen if only one hunt
            if (huntType === "driven") {
                navigation.navigate("DrivenHuntStatisticsDetailScreen", {
                    statisticsItem: hunts[0] as DrivenHuntStatisticsItem,
                });
            } else {
                navigation.navigate("IndividualHuntStatisticsDetailScreen", {
                    statisticsItem: hunts[0] as IndividualHuntStatisticsItem,
                });
            }
        } else {
            // Navigate to list screen if multiple hunts
            if (huntType === "driven") {
                navigation.navigate("DrivenHuntListStatisticsScreen", {
                    districtId: props.huntPlace.placeId,
                    huntPlaceName: props.huntPlace.name,
                    selectedSeason: props.selectedSeason,
                    filterType,
                    filteredHunts: hunts as DrivenHuntStatisticsItem[],
                });
            } else {
                navigation.navigate("IndividualHuntListStatisticsScreen", {
                    huntEventPlaceId: props.huntPlace.placeId,
                    huntPlaceName: props.huntPlace.name,
                    selectedSeason: props.selectedSeason,
                    filterType,
                    filteredHunts: hunts as IndividualHuntStatisticsItem[],
                });
            }
        }
    }

    return (
        <View>
            <Text weight="bold">
                {props.huntPlace.name}, {props.selectedSeason}
            </Text>
            <Spacer size={16} />
            <View style={styles.sectionContainer}>
                <StatisticsHuntInfoCard
                    title={t("statistics.totalTime")}
                    value={formatTimeSpent(props.huntPlace.totalTime)}
                    onPress={() => {}}
                />
                <View style={styles.percentsContent}>
                    <StatisticsHuntInfoCard
                        count={props.huntPlace.huntsWithAnimals}
                        title={t("statistics.huntsWithAnimals")}
                        value={formatHuntStatistics(props.huntPlace.huntsWithAnimals, props.huntPlace.count)}
                        onPress={() => onNavigating(props.huntPlace.huntsWithAnimalsData, "withAnimals")}
                    />

                    <Spacer horizontal size={10} />
                    <StatisticsHuntInfoCard
                        count={props.huntPlace.huntsWithoutAnimals}
                        title={t("statistics.huntsWithoutAnimals")}
                        value={formatHuntStatistics(props.huntPlace.huntsWithoutAnimals, props.huntPlace.count)}
                        disabled={props.huntPlace.huntsWithoutAnimals === 0}
                        onPress={() => onNavigating(props.huntPlace.huntsWithoutAnimalsData, "withoutAnimals")}
                    />
                </View>
                <StatisticsHuntInfoCard
                    title={t("statistics.totalHunts")}
                    count={props.huntPlace.count}
                    value={props.huntPlace.count.toString()}
                    onPress={() => onNavigating(props.huntPlace.allHunts, "all")}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        gap: 10,
    },
    percentsContent: {
        flexDirection: "row",
    },
});
