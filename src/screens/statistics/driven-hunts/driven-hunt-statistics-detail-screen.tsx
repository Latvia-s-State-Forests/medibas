import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { ReadOnlyField } from "~/components/read-only-field";
import { HuntLocationViewer } from "~/screens/hunt/driven-hunt/hunt-location-viewer";
import { HuntedSpeciesList } from "~/screens/hunt/driven-hunt/lists/hunted-species-list";
import { BeaterListStatistics } from "~/screens/statistics/beater-list-statistics";
import { DogListStatistics } from "~/screens/statistics/dog-list-statistics";
import { HunterListStatistics } from "~/screens/statistics/hunter-list-statistics";
import { TargetSpeciesListStatistics } from "~/screens/statistics/target-species-list-statistics";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { formatDate, formatTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";

type DrivenHuntStatisticsDetailScreenProps = NativeStackScreenProps<
    RootNavigatorParams,
    "DrivenHuntStatisticsDetailScreen"
>;

export function DrivenHuntStatisticsDetailScreen({ route }: DrivenHuntStatisticsDetailScreenProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { statisticsItem } = route.params;

    const districts = React.useMemo(() => {
        const districtDescriptions = statisticsItem.districts.map((district) => district.descriptionLv.trim());
        districtDescriptions.sort((a, b) => a.localeCompare(b));
        const districts = districtDescriptions.join(";\n") + (statisticsItem.districts.length > 1 ? "." : "");
        return districts;
    }, [statisticsItem.districts]);

    return (
        <View style={styles.container}>
            <Header title={statisticsItem.huntEventCode ?? ""} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <View style={styles.formContentContainer}>
                    <ReadOnlyField
                        label={t("statistics.drivenHunt.details.huntCode")}
                        value={statisticsItem.huntEventCode ?? ""}
                    />
                    <ReadOnlyField
                        label={t("statistics.drivenHunt.details.huntDate")}
                        value={formatDate(statisticsItem.plannedFrom)}
                    />
                    {statisticsItem.notes ? (
                        <ReadOnlyField label={t("statistics.drivenHunt.details.notes")} value={statisticsItem.notes} />
                    ) : null}
                    {statisticsItem.meetingTime ? (
                        <ReadOnlyField
                            label={t("statistics.drivenHunt.details.meetingTime")}
                            value={formatTime(statisticsItem.meetingTime)}
                        />
                    ) : null}
                    {statisticsItem.meetingPoint[1] && statisticsItem.meetingPoint[0] ? (
                        <>
                            <HuntLocationViewer
                                huntType="drivenHunt"
                                latitude={statisticsItem.meetingPoint[1]}
                                longitude={statisticsItem.meetingPoint[0]}
                            />
                            <ReadOnlyField
                                label={t("statistics.drivenHunt.details.meetingPoint")}
                                value={formatPosition({
                                    latitude: statisticsItem.meetingPoint[1],
                                    longitude: statisticsItem.meetingPoint[0],
                                })}
                            />
                        </>
                    ) : null}

                    <ReadOnlyField label={t("statistics.drivenHunt.details.districts")} value={districts} />
                    <ReadOnlyField
                        label={t("statistics.drivenHunt.details.huntManager")}
                        value={statisticsItem.huntManagerName || t("statistics.drivenHunt.details.huntManagerEmpty")}
                    />
                    <TargetSpeciesListStatistics hunt={statisticsItem} />
                    <HuntedSpeciesList hunt={statisticsItem} />
                    <HunterListStatistics hunt={statisticsItem} />
                    <BeaterListStatistics hunt={statisticsItem} />
                    <DogListStatistics hunt={statisticsItem} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingTop: 24,
    },
    formContentContainer: {
        gap: 24,
    },
});
