import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { isSameDay } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { Button } from "~/components/button";
import { Collapsible } from "~/components/collapsible/collapsible";
import { EmptyListMessage } from "~/components/empty-list-message";
import { Header } from "~/components/header";
import { HuntingCard } from "~/components/hunting-card";
import { useHunts } from "~/hooks/use-hunts";
import { usePermissions } from "~/hooks/use-permissions";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { Hunt, HuntEventStatus, HuntEventType } from "~/types/hunts";
import { formatDate } from "~/utils/format-date-time";
import { generateQRCodeValue } from "~/utils/generate-qr-code";
import { getQrHuntDescription } from "~/utils/get-qr-hunt-description";
import { sortHuntsByDate } from "~/utils/sort-hunts-by-date";
import { JoinDrivenHuntUsingCode } from "./join-driven-hunt/join-driven-hunt-using-code";

type HuntWithTitle = Hunt & { title: string; huntManagerName: string };

export function DrivenHuntListScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const permissions = usePermissions();
    const allHunts = useHunts();

    useFocusEffect(
        React.useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.hunts });
            });
        }, [])
    );

    const hunts = React.useMemo(() => {
        const drivenHunts = allHunts.filter((hunt) => hunt.huntEventTypeId === HuntEventType.DrivenHunt);
        const hunts = drivenHunts.reduce(
            (acc, hunt) => {
                const districtNames = hunt.districts?.map((district) => district.descriptionLv.trim()).join(", ");
                const huntManagerName = hunt.huntManagerName ? hunt.huntManagerName : t("hunt.drivenHunt.emptyManager");
                const title = `${hunt.vmdCode}, ${districtNames}`;

                const isHuntToday = isSameDay(new Date(hunt.plannedFrom), new Date());
                if (
                    !isHuntToday &&
                    (hunt.huntEventStatusId === HuntEventStatus.Active ||
                        hunt.huntEventStatusId === HuntEventStatus.Paused)
                ) {
                    acc.concluded.push({
                        ...hunt,
                        title,
                        huntManagerName,
                    });
                    return acc;
                }

                match(hunt.huntEventStatusId)
                    .with(HuntEventStatus.Scheduled, () => {
                        acc.scheduled.push({ ...hunt, title, huntManagerName });
                    })
                    .with(HuntEventStatus.Active, () => {
                        acc.active.push({ ...hunt, title, huntManagerName });
                    })
                    .with(HuntEventStatus.Paused, () => {
                        acc.active.push({ ...hunt, title, huntManagerName });
                    })
                    .with(HuntEventStatus.Concluded, () => {
                        acc.concluded.push({ ...hunt, title, huntManagerName });
                    });

                return acc;
            },
            { active: [], scheduled: [], concluded: [] } as {
                active: HuntWithTitle[];
                scheduled: HuntWithTitle[];
                concluded: HuntWithTitle[];
            }
        );

        hunts.active = sortHuntsByDate(hunts.active, "asc");
        hunts.scheduled = sortHuntsByDate(hunts.scheduled, "asc");
        hunts.concluded = sortHuntsByDate(hunts.concluded, "desc");

        return hunts;
    }, [allHunts, t]);

    return (
        <View style={styles.container}>
            <Header title={t("hunt.drivenHunt.hunt")} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingRight: insets.right + 16,
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <View style={styles.buttonContainer}>
                    {permissions.createDrivenHunt() ? (
                        <View style={styles.addHunt}>
                            <Button
                                variant="secondary-dark"
                                icon="plus"
                                onPress={() =>
                                    navigation.navigate("DrivenHuntFormScreen", {
                                        huntToEdit: undefined,
                                    })
                                }
                                title={t("hunt.drivenHunt.addHunt")}
                            />
                        </View>
                    ) : null}

                    <JoinDrivenHuntUsingCode />
                </View>
                {hunts.active.length || hunts.scheduled.length || hunts.concluded.length ? (
                    <>
                        {hunts.active.length ? (
                            <Collapsible
                                defaultCollapsed={false}
                                title={t("hunt.drivenHunt.status.active")}
                                badgeCount={hunts.active.length}
                            >
                                <View style={styles.cardContainer}>
                                    {hunts.active.map((hunt) => {
                                        const date = formatDate(hunt.plannedFrom);
                                        const status =
                                            hunt.huntEventStatusId === HuntEventStatus.Paused ? "pause" : "active";
                                        return (
                                            <HuntingCard
                                                status={status}
                                                key={hunt.id}
                                                onPress={() => {
                                                    navigation.navigate("DrivenHuntDetailScreen", {
                                                        huntId: hunt.id,
                                                    });
                                                }}
                                                title={hunt.title}
                                                name={hunt.huntManagerName}
                                                date={date}
                                            />
                                        );
                                    })}
                                </View>
                            </Collapsible>
                        ) : null}
                        {hunts.scheduled.length ? (
                            <Collapsible
                                defaultCollapsed={false}
                                title={t("hunt.drivenHunt.status.scheduled")}
                                badgeCount={hunts.scheduled.length}
                            >
                                <View style={styles.cardContainer}>
                                    {hunts.scheduled.map((hunt) => {
                                        const date = formatDate(hunt.plannedFrom);
                                        return (
                                            <HuntingCard
                                                key={hunt.id}
                                                onPress={() => {
                                                    navigation.navigate(
                                                        hunt.isReducedInfo
                                                            ? "DrivenHuntReducedDetailScreen"
                                                            : "DrivenHuntDetailScreen",
                                                        { huntId: hunt.id }
                                                    );
                                                }}
                                                title={hunt.title}
                                                name={hunt.huntManagerName}
                                                date={date}
                                                hasQRCode={!hunt.isReducedInfo}
                                                QRCodeValue={generateQRCodeValue(hunt)}
                                                qrDescription={getQrHuntDescription(hunt)}
                                            />
                                        );
                                    })}
                                </View>
                            </Collapsible>
                        ) : null}
                        {hunts.concluded.length ? (
                            <Collapsible
                                defaultCollapsed={false}
                                lastInList
                                title={t("hunt.drivenHunt.status.concluded")}
                                badgeCount={hunts.concluded.length}
                            >
                                <View style={styles.cardContainer}>
                                    {hunts.concluded.map((hunt) => {
                                        const date = formatDate(hunt.plannedFrom);
                                        return (
                                            <HuntingCard
                                                key={hunt.id}
                                                onPress={() => {
                                                    navigation.navigate("DrivenHuntDetailScreen", {
                                                        huntId: hunt.id,
                                                    });
                                                }}
                                                title={hunt.title}
                                                name={hunt.huntManagerName}
                                                date={date}
                                            />
                                        );
                                    })}
                                </View>
                            </Collapsible>
                        ) : null}
                    </>
                ) : (
                    <EmptyListMessage icon="hunt" label={t("hunt.drivenHunt.emptyMessage")} />
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
    buttonContainer: {
        paddingVertical: 8,
        gap: 8,
        borderBottomColor: theme.color.gray2,
        borderBottomWidth: 1,
    },
    addHunt: {
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
        paddingBottom: 8,
    },
    cardContainer: {
        gap: 8,
    },
});
