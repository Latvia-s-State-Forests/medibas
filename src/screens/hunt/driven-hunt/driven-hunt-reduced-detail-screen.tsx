import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { NavigationButton } from "~/components/navigation-button";
import { ReadOnlyField } from "~/components/read-only-field";
import { useHunt } from "~/hooks/use-hunt";
import { logger } from "~/logger";
import { theme } from "~/theme";
import { Hunt } from "~/types/hunts";
import { RootNavigatorParams } from "~/types/navigation";
import { formatDate, formatTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";
import { DrivenHuntMeetingPlace } from "./driven-hunt-meeting-place";
import { TargetSpeciesList } from "./lists/target-species-list";

type DrivenHuntReducedDetailScreenProps = NativeStackScreenProps<RootNavigatorParams, "DrivenHuntReducedDetailScreen">;

export function DrivenHuntReducedDetailScreen({ navigation, route }: DrivenHuntReducedDetailScreenProps) {
    const hunt = useHunt(route.params.huntId);

    if (!hunt) {
        logger.error(`Driven hunt with id ${route.params.huntId} not available`);
        navigation.goBack();
        return null;
    }

    return <Content hunt={hunt} />;
}

type ContentProps = {
    hunt: Hunt;
};

function Content({ hunt }: ContentProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const locationLabel = `${hunt.vmdCode} ${t("hunt.drivenHunt.meetingPlace")}`;

    return (
        <View style={styles.container}>
            <Header title={hunt.vmdCode} />
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
                <View style={styles.dateAndTimeContainer}>
                    <View style={styles.date}>
                        <ReadOnlyField
                            label={t("hunt.drivenHunt.detailScreen.huntDate")}
                            value={formatDate(hunt.plannedFrom)}
                        />
                    </View>
                    {hunt.meetingTime ? (
                        <View style={styles.time}>
                            <ReadOnlyField
                                label={t("hunt.drivenHunt.detailScreen.meetingTime")}
                                value={formatTime(hunt.meetingTime)}
                            />
                        </View>
                    ) : null}
                </View>
                {hunt.notes ? (
                    <ReadOnlyField label={t("hunt.drivenHunt.detailScreen.notes")} value={hunt.notes} />
                ) : null}
                {hunt.meetingPointY && hunt.meetingPointX ? (
                    <>
                        <DrivenHuntMeetingPlace latitude={hunt.meetingPointY} longitude={hunt.meetingPointX} />
                        <View style={styles.navigation}>
                            <ReadOnlyField
                                label={t("hunt.drivenHunt.detailScreen.meetingPoint")}
                                value={formatPosition({
                                    latitude: hunt.meetingPointY,
                                    longitude: hunt.meetingPointX,
                                })}
                            />
                            <NavigationButton
                                latitude={hunt.meetingPointY}
                                longitude={hunt.meetingPointX}
                                locationLabel={locationLabel}
                            />
                        </View>
                    </>
                ) : null}
                <ReadOnlyField
                    label={t("hunt.drivenHunt.detailScreen.districts")}
                    value={
                        hunt.districts.map((district) => district.descriptionLv.trim()).join(";\n") +
                        (hunt.districts.length > 1 ? "." : "")
                    }
                />
                <ReadOnlyField
                    label={t("hunt.drivenHunt.detailScreen.huntManager")}
                    value={hunt.huntManagerName || t("hunt.drivenHunt.detailScreen.huntManagerEmpty")}
                />
                <TargetSpeciesList hunt={hunt} />
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
        gap: 24,
    },
    dateAndTimeContainer: {
        flexDirection: "row",
    },
    date: {
        flex: 1,
    },
    time: {
        flex: 2,
    },
    navigation: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});
