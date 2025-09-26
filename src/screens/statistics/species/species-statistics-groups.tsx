import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, View, ViewStyle } from "react-native";
import { Collapsible } from "~/components/collapsible/collapsible";
import { ReadOnlyField } from "~/components/read-only-field";
import { SegmentedControl } from "~/components/segmented-control";
import { configuration } from "~/configuration";
import {
    LimitedSpeciesGroup,
    UnlimitedWithLimitedUnlimitedGroup,
    BirdSpeciesGroup,
} from "~/screens/statistics/species/species-statistics-group-by-type";
import { StatisticsSummaryRow } from "~/screens/statistics/statistics-summary-row";
import { SpeciesId } from "~/types/classifiers";
import { LimitedSpecies } from "~/types/hunt";
import { RootNavigatorParams } from "~/types/navigation";
import { StatisticsSpeciesItem } from "~/types/statistics";
import { Spacer } from "../../../components/spacer";

type NavigationProp = NativeStackNavigationProp<RootNavigatorParams>;

interface SpeciesStatisticsGroupsProps {
    huntSeasonOptions: Array<{ label: string; value: string }>;
    selectedSeason: string;
    onSeasonChange: (season: string) => void;
    limitedSpeciesGroups: LimitedSpeciesGroup[];
    unlimitedWithLimitedUnlimitedGroups: UnlimitedWithLimitedUnlimitedGroup[];
    birdSpeciesGroups: BirdSpeciesGroup[];
    limitedUnlimitedSpecies: LimitedSpecies[];
    summaryRowContainerStyle: StyleProp<ViewStyle>;
}

export function SpeciesStatisticsGroups(props: SpeciesStatisticsGroupsProps) {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();

    function handleSpeciesNavigation(
        items: StatisticsSpeciesItem[],
        speciesName: string,
        speciesType: "limited" | "unlimited" | "limitedUnlimited"
    ) {
        if (items.length === 1) {
            // Navigate directly to detail screen if only one hunt report
            navigation.navigate("SpeciesStatisticsDetailScreen", {
                statisticsItem: items[0],
                speciesName,
                speciesType,
            });
        } else {
            // Navigate to list screen if multiple hunt reports
            navigation.navigate("SpeciesStatisticsListScreen", {
                speciesName,
                speciesType,
                selectedSeason: props.selectedSeason,
                filteredItems: items,
            });
        }
    }

    return (
        <>
            {props.huntSeasonOptions.length > 1 ? (
                <>
                    <SegmentedControl
                        label={t("statistics.huntSeason")}
                        options={props.huntSeasonOptions}
                        value={props.selectedSeason}
                        onChange={props.onSeasonChange}
                    />
                    <Spacer size={24} />
                </>
            ) : (
                <ReadOnlyField label={t("statistics.huntSeason")} value={props.selectedSeason} />
            )}

            {props.limitedSpeciesGroups.length > 0 && (
                <Collapsible
                    defaultCollapsed={false}
                    title={t("statistics.limitedSpecies") + ", " + props.selectedSeason}
                    lastInList={
                        props.unlimitedWithLimitedUnlimitedGroups.length === 0 && props.birdSpeciesGroups.length === 0
                    }
                >
                    <View style={props.summaryRowContainerStyle}>
                        {props.limitedSpeciesGroups.map(
                            ({ speciesId, permitTypeId, count, speciesName, permitTypeName, items }) => (
                                <StatisticsSummaryRow
                                    key={`${speciesId}-${permitTypeId}`}
                                    title={permitTypeName} // show full name with parentheses
                                    count={count}
                                    iconName={configuration.hunt.speciesIcons[speciesId as SpeciesId] || "animals"}
                                    onPress={() => handleSpeciesNavigation(items, speciesName, "limited")}
                                />
                            )
                        )}
                    </View>
                </Collapsible>
            )}

            {props.unlimitedWithLimitedUnlimitedGroups.length > 0 && (
                <Collapsible
                    defaultCollapsed={false}
                    title={t("statistics.unlimitedSpecies") + ", " + props.selectedSeason}
                    lastInList={props.birdSpeciesGroups.length === 0}
                >
                    <View style={props.summaryRowContainerStyle}>
                        {props.unlimitedWithLimitedUnlimitedGroups.map(
                            ({ speciesId, permitTypeId, count, displayName, speciesName, items }) => (
                                <StatisticsSummaryRow
                                    key={`${speciesId}-u-${permitTypeId}`}
                                    title={displayName}
                                    count={count}
                                    iconName={configuration.hunt.speciesIcons[speciesId as SpeciesId] || "animals"}
                                    onPress={() =>
                                        handleSpeciesNavigation(
                                            items,
                                            speciesName,
                                            props.limitedUnlimitedSpecies.some((s) => s.id === speciesId)
                                                ? "limitedUnlimited"
                                                : "unlimited"
                                        )
                                    }
                                />
                            )
                        )}
                    </View>
                </Collapsible>
            )}

            {props.birdSpeciesGroups.length > 0 && (
                <Collapsible
                    defaultCollapsed={false}
                    title={t("statistics.birds") + ", " + props.selectedSeason}
                    lastInList={true}
                >
                    <View style={props.summaryRowContainerStyle}>
                        {props.birdSpeciesGroups.map(({ speciesId, count, speciesName, items }) => (
                            <StatisticsSummaryRow
                                key={speciesId}
                                title={speciesName}
                                count={count}
                                iconName={configuration.hunt.speciesIcons[speciesId as SpeciesId] || "birds"}
                                onPress={() => handleSpeciesNavigation(items, speciesName, "unlimited")}
                            />
                        ))}
                    </View>
                </Collapsible>
            )}
        </>
    );
}
