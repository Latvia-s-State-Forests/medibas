import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { isBefore, startOfDay } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { Collapsible } from "~/components/collapsible/collapsible";
import { EmptyListMessage } from "~/components/empty-list-message";
import { Header } from "~/components/header";
import { IndividualHuntingCard } from "~/components/individual-hunting-card";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useHunts } from "~/hooks/use-hunts";
import { usePermissions } from "~/hooks/use-permissions";
import { getAppLanguage } from "~/i18n";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { Hunt, HuntEventStatus, HuntEventType, HuntPlace } from "~/types/hunts";
import { formatDate } from "~/utils/format-date-time";
import { sortHuntsByDate } from "~/utils/sort-hunts-by-date";

type HuntWithTitle = Hunt & {
    title: string;
    description: string;
    district: string;
    huntingSpecies: string;
};

export function IndividualHuntListScreen() {
    const allHunts = useHunts();
    const { t } = useTranslation();
    const language = getAppLanguage();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const classifiers = useClassifiers();
    const permissions = usePermissions();
    const hasPermissionToCreateIndividualHunt = permissions.createIndividualHunt();

    useFocusEffect(
        React.useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                queryClient.invalidateQueries(queryKeys.hunts);
            });
        }, [])
    );

    const getPlaceName = React.useCallback(
        (placeId: HuntPlace | undefined) => {
            if (placeId === undefined) {
                return "";
            }

            const HUNT_PLACE_ID: {
                [key in HuntPlace]: string;
            } = {
                1: t("hunt.individualHunt.inTheStation"),
                2: t("hunt.individualHunt.waterBody"),
                3: t("hunt.individualHunt.outSideStation"),
            };

            return HUNT_PLACE_ID[placeId];
        },
        [t]
    );

    function onNavigateToIndividualHunt() {
        navigation.navigate("IndividualHuntFormScreen", {});
    }

    function onNavigateToHuntDetailsScreen({ huntId }: { huntId: number }) {
        navigation.navigate("IndividualHuntDetailScreen", {
            huntId,
        });
    }

    function getHuntStatus(hunt: Hunt) {
        const isApproved = hunt.isIndividualHuntApproved;
        const hasRejectionReason = !!hunt.reasonForRejection;
        const isInStation = hunt.huntEventPlaceId === HuntPlace.InTheStation;
        const districtId = hunt.districts?.[0]?.id ?? 0;
        const canApproveOrRejectHunt = permissions.approveOrRejectIndividualHunt(districtId);

        if (!isInStation) {
            return undefined;
        }

        if (!isApproved && !hasRejectionReason) {
            return canApproveOrRejectHunt ? "waiting-for-approval-or-deny" : undefined;
        }

        if (isApproved) {
            return "seen";
        }

        if (!isApproved && hasRejectionReason) {
            return "declined";
        }
    }

    const hunts = React.useMemo(() => {
        const individualHunts = allHunts.filter((hunt) => hunt.huntEventTypeId === HuntEventType.IndividualHunt);
        const hunts = individualHunts.reduce(
            (acc, hunt) => {
                const title = `${hunt.vmdCode}`;
                const propertyName = hunt?.propertyName || "";
                const huntType = getPlaceName(hunt.huntEventPlaceId);
                const isInStation = hunt.huntEventPlaceId === HuntPlace.InTheStation;
                const district = hunt.districts?.map((d) => d.descriptionLv).join(", ") || "";
                const description = [huntType, isInStation ? district : propertyName].filter(Boolean).join(", ");
                const huntingSpecies =
                    hunt.targetSpecies
                        ?.map((hs) => classifiers.animalSpecies.options[hs.speciesId].description[language])
                        .join(", ") || "";

                const isPastPlannedDate = hunt.plannedTo && isBefore(new Date(hunt.plannedTo), startOfDay(new Date()));
                if (isPastPlannedDate && hunt.huntEventStatusId === HuntEventStatus.Active) {
                    acc.concluded.push({
                        ...hunt,
                        title,
                        district,
                        description,
                        huntingSpecies,
                    });
                    return acc;
                }

                match(hunt.huntEventStatusId)
                    .with(HuntEventStatus.Scheduled, () => {
                        acc.scheduled.push({
                            ...hunt,
                            title,
                            district,
                            description,
                            huntingSpecies,
                        });
                    })
                    .with(HuntEventStatus.Active, () => {
                        acc.active.push({
                            ...hunt,
                            title,
                            district,
                            description,
                            huntingSpecies,
                        });
                    })
                    .with(HuntEventStatus.Concluded, () => {
                        acc.concluded.push({
                            ...hunt,
                            title,
                            district,
                            description,
                            huntingSpecies,
                        });
                    });

                return acc;
            },
            { active: [], scheduled: [], concluded: [] } as {
                active: HuntWithTitle[];
                scheduled: HuntWithTitle[];
                concluded: HuntWithTitle[];
            }
        );

        return hunts;
    }, [allHunts, classifiers.animalSpecies.options, getPlaceName, language]);

    function formatHuntDate(plannedFrom?: string, plannedTo?: string) {
        const dateFrom = formatDate(plannedFrom ?? "");
        const dateTo = formatDate(plannedTo ?? "");
        return dateFrom !== dateTo ? `${dateFrom} - ${dateTo}` : dateFrom;
    }

    function hasPermissionToViewHunt(hunt: Hunt) {
        const hunterPersonId = hunt.hunters[0]?.personId;
        if (!hunterPersonId) {
            return false;
        }
        const huntPlace = hunt.huntEventPlaceId;
        if (!huntPlace) {
            return false;
        }
        const huntEventStatus = hunt.huntEventStatusId;
        const districtId = hunt.districts[0]?.id;
        return permissions.viewIndividualHunt(hunterPersonId, huntEventStatus, huntPlace, districtId);
    }

    return (
        <View style={styles.container}>
            <Header title={t("hunt.individualHunt.hunt")} />

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
                {hasPermissionToCreateIndividualHunt && (
                    <View style={styles.addIndividualHuntButtonContainer}>
                        <Button
                            icon="plus"
                            title={t("hunt.individualHunt.addHunt")}
                            variant="secondary-dark"
                            onPress={onNavigateToIndividualHunt}
                            style={styles.addIndividualHuntButton}
                        />
                    </View>
                )}

                {hunts.active.length || hunts.scheduled.length || hunts.concluded.length ? (
                    <>
                        {hunts.active.length ? (
                            <Collapsible
                                defaultCollapsed={false}
                                title={t("hunt.individualHunt.status.active")}
                                badgeCount={hunts.active.length}
                            >
                                <View style={styles.cardContainer}>
                                    {sortHuntsByDate(hunts.active, "asc").map((hunt) => {
                                        const date = formatHuntDate(hunt.plannedFrom, hunt.plannedTo);
                                        const hasPermissionToViewIndividualHunt = hasPermissionToViewHunt(hunt);

                                        return (
                                            <IndividualHuntingCard
                                                date={date}
                                                hunterName={hunt.hunters?.[0]?.fullName ?? ""}
                                                key={hunt.id}
                                                status="active"
                                                title={hunt.title}
                                                description={hunt.description}
                                                disabled={!hasPermissionToViewIndividualHunt}
                                                onPress={() => {
                                                    onNavigateToHuntDetailsScreen({ huntId: hunt.id ?? 0 });
                                                }}
                                            />
                                        );
                                    })}
                                </View>
                            </Collapsible>
                        ) : null}
                        {hunts.scheduled.length ? (
                            <Collapsible
                                defaultCollapsed={false}
                                title={t("hunt.individualHunt.status.scheduled")}
                                badgeCount={hunts.scheduled.length}
                            >
                                <View style={styles.cardContainer}>
                                    {sortHuntsByDate(hunts.scheduled, "asc").map((hunt) => {
                                        const date = formatHuntDate(hunt.plannedFrom, hunt.plannedTo);
                                        const status = getHuntStatus(hunt);
                                        const hasPermissionToViewIndividualHunt = hasPermissionToViewHunt(hunt);

                                        return (
                                            <IndividualHuntingCard
                                                date={date}
                                                hunterName={hunt.hunters?.[0]?.fullName ?? ""}
                                                key={hunt.id}
                                                status={status}
                                                disabled={!hasPermissionToViewIndividualHunt}
                                                title={hunt.title}
                                                description={hunt.description}
                                                onPress={() => {
                                                    onNavigateToHuntDetailsScreen({ huntId: hunt.id ?? 0 });
                                                }}
                                            />
                                        );
                                    })}
                                </View>
                            </Collapsible>
                        ) : null}
                        {hunts.concluded.length ? (
                            <Collapsible
                                lastInList
                                defaultCollapsed={false}
                                title={t("hunt.individualHunt.status.concluded")}
                                badgeCount={hunts.concluded.length}
                            >
                                <View style={styles.cardContainer}>
                                    {sortHuntsByDate(hunts.concluded, "desc").map((hunt) => {
                                        const date = formatHuntDate(hunt.plannedFrom, hunt.plannedTo);
                                        const hasPermissionToViewIndividualHunt = hasPermissionToViewHunt(hunt);

                                        return (
                                            <IndividualHuntingCard
                                                date={date}
                                                hunterName={hunt.hunters?.[0]?.fullName ?? ""}
                                                key={hunt.id}
                                                title={hunt.title}
                                                description={hunt.description}
                                                disabled={!hasPermissionToViewIndividualHunt}
                                                onPress={() => {
                                                    onNavigateToHuntDetailsScreen({ huntId: hunt.id ?? 0 });
                                                }}
                                            />
                                        );
                                    })}
                                </View>
                            </Collapsible>
                        ) : null}
                    </>
                ) : (
                    <EmptyListMessage icon="hunt" label={t("hunt.individualHunt.emptyMessage")} />
                )}
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
        flexGrow: 1,
    },
    addIndividualHuntButtonContainer: {
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
    },
    addIndividualHuntButton: {
        paddingVertical: 24,
    },
    cardContainer: {
        gap: 8,
    },
});
