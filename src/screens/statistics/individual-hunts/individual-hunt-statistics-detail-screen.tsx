import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { NavigationButtonField } from "~/components/navigation-button-field";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { HuntLocationViewer } from "~/screens/hunt/driven-hunt/hunt-location-viewer";
import { HuntedSpeciesList } from "~/screens/hunt/driven-hunt/lists/hunted-species-list";
import { theme } from "~/theme";
import { HuntPlace } from "~/types/hunts";
import { formatDate } from "~/utils/format-date-time";
import { formatIndividualHuntDogs } from "~/utils/format-individual-hunt-dogs";
import { getEquipmentTranslations } from "~/utils/format-individual-hunt-equipment";
import { formatIndividualHuntHuntedSpecies } from "~/utils/format-individual-hunt-hunted-species";
import { formatPosition } from "~/utils/format-position";
import { RootNavigatorParams } from "../../../types/navigation";
import { useGetHuntPlaceName } from "../../../utils/get-hunt-place-name";

type IndividualHuntStatisticsDetailScreenProps = NativeStackScreenProps<
    RootNavigatorParams,
    "IndividualHuntStatisticsDetailScreen"
>;

export function IndividualHuntStatisticsDetailScreen({ route }: IndividualHuntStatisticsDetailScreenProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const insets = useSafeAreaInsets();
    const classifiers = useClassifiers();
    const getPlaceName = useGetHuntPlaceName();
    const statisticsItem = route.params.statisticsItem;
    const dateFrom = formatDate(statisticsItem.plannedFrom ?? "");
    const dateTo = formatDate(statisticsItem.plannedTo ?? "");
    const equalHuntStartEndDates = dateTo === dateFrom;
    const locationLabel = `${statisticsItem.huntEventCode} ${t("hunt.individualHunt.huntPlace")}`;
    const district = statisticsItem.districts?.map((d) => d.descriptionLv).join(", ");
    const waterBody = statisticsItem.propertyName;

    const huntDogs = React.useMemo(() => {
        return formatIndividualHuntDogs(statisticsItem.dogs, classifiers, language, t);
    }, [statisticsItem.dogs, classifiers, language, t]);

    const huntedSpecies = React.useMemo(() => {
        return formatIndividualHuntHuntedSpecies(statisticsItem.targetSpecies, classifiers, language);
    }, [statisticsItem.targetSpecies, classifiers, language]);

    return (
        <View style={styles.container}>
            <Header title={statisticsItem.huntEventCode} />
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

                <View style={styles.detailsContainer}>
                    <ReadOnlyField
                        label={t("statistics.individualHunt.details.huntCode")}
                        value={statisticsItem.huntEventCode}
                    />

                    <ReadOnlyField
                        label={t("statistics.individualHunt.details.huntSeason")}
                        value={statisticsItem.huntSeason}
                    />

                    {statisticsItem.notes ? (
                        <ReadOnlyField
                            label={t("statistics.individualHunt.details.notes")}
                            value={statisticsItem.notes}
                        />
                    ) : null}

                    <ReadOnlyField
                        label={t("statistics.individualHunt.details.huntType")}
                        value={getPlaceName(statisticsItem.huntEventPlaceId)}
                    />

                    {statisticsItem.huntEventPlaceId === HuntPlace.InTheStation && (
                        <ReadOnlyField
                            label={t("statistics.individualHunt.details.huntDistrict")}
                            value={district ?? ""}
                        />
                    )}
                    {statisticsItem.huntEventPlaceId === HuntPlace.WaterBody && (
                        <ReadOnlyField
                            label={t("statistics.individualHunt.details.waterBodyName")}
                            value={waterBody ?? ""}
                        />
                    )}

                    <ReadOnlyField
                        label={
                            equalHuntStartEndDates
                                ? t("statistics.individualHunt.details.huntDate")
                                : t("statistics.individualHunt.details.huntStartDate")
                        }
                        value={dateFrom}
                    />

                    {!equalHuntStartEndDates ? (
                        <ReadOnlyField label={t("statistics.individualHunt.details.huntEndDate")} value={dateTo} />
                    ) : null}

                    {statisticsItem.meetingPoint[0] && statisticsItem.meetingPoint[1] ? (
                        <>
                            <HuntLocationViewer
                                huntType="individualHunt"
                                latitude={statisticsItem.meetingPoint[1]}
                                longitude={statisticsItem.meetingPoint[0]}
                            />
                            <NavigationButtonField
                                label={t("mtl.infrastructure.coordinates")}
                                value={formatPosition({
                                    latitude: statisticsItem.meetingPoint[1],
                                    longitude: statisticsItem.meetingPoint[0],
                                })}
                                latitude={statisticsItem.meetingPoint[1]}
                                longitude={statisticsItem.meetingPoint[0]}
                                locationLabel={locationLabel}
                            />
                        </>
                    ) : null}

                    {huntDogs.length > 0 && (
                        <ReadOnlyField label={t("statistics.individualHunt.details.dogs")} value={huntDogs} />
                    )}
                    {!statisticsItem.hasTargetSpecies ? (
                        <ReadOnlyField
                            label={t("statistics.individualHunt.details.huntedSpecies")}
                            value={t("statistics.individualHunt.details.huntAllSpecies")}
                        />
                    ) : huntedSpecies.length > 0 ? (
                        <ReadOnlyField
                            label={t("statistics.individualHunt.details.huntedSpecies")}
                            value={huntedSpecies}
                        />
                    ) : null}

                    {getEquipmentTranslations(statisticsItem, t).length > 0 && (
                        <ReadOnlyField
                            label={t("hunt.equipment.additional")}
                            value={getEquipmentTranslations(statisticsItem, t)}
                        />
                    )}

                    {statisticsItem.huntedAnimals.length > 0 ? <HuntedSpeciesList hunt={statisticsItem} /> : null}
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
    detailsContainer: {
        gap: 24,
    },
});
