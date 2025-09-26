import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, StyleSheet, View } from "react-native";
import { CardButton } from "~/components/card-button";
import { useHuntActivitiesCount, usePendingHuntActivitiesCount } from "~/components/hunt-activities-provider";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { Select } from "~/components/select";
import { SettingsButton } from "~/components/settings-button";
import { Spacer } from "~/components/spacer";
import { useInjuredAnimalPermits } from "~/hooks/use-injured-animal-permits";
import { usePermissions } from "~/hooks/use-permissions";
import { useProfile } from "~/hooks/use-profile";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";

export function HuntScreen() {
    const { t } = useTranslation();
    const profile = useProfile();
    const [selectedDistrictId, setSelectedDistrictId] = useSelectedDistrictId();
    const navigation = useNavigation();
    const injuredAnimalPermits = useInjuredAnimalPermits();
    const injuredAnimalsCount = injuredAnimalPermits.length;
    const huntActivitiesCount = useHuntActivitiesCount();
    const pendingHuntActivitiesCount = usePendingHuntActivitiesCount();
    const permissions = usePermissions();

    useFocusEffect(
        React.useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.hunts });
            });
        }, [])
    );

    function onNavigateDrivenHunt() {
        navigation.navigate("DrivenHuntListScreen");
    }

    function onNavigateRegisterPrey() {
        navigation.navigate("RegisterPreyScreen", {});
    }

    function onNavigateActivitiesList() {
        navigation.navigate("HuntActivitiesListScreen");
    }

    function onNavigateIndividualHunt() {
        navigation.navigate("IndividualHuntListScreen");
    }

    const hasPermissionToRegisterHunt = permissions.registerHunt;

    return (
        <ScreenBackgroundLayout style={styles.container}>
            <View style={styles.body}>
                <View style={styles.rowContent}>
                    <SettingsButton />
                    <Spacer horizontal size={16} />
                    <View style={styles.fullWidth}>
                        <Select
                            label={t("mtl.district")}
                            options={profile.memberships.map((m) => ({
                                label: m.huntingDistrict.descriptionLv,
                                value: String(m.huntingDistrict.id),
                            }))}
                            value={String(selectedDistrictId) ?? ""}
                            onChange={(value) => setSelectedDistrictId(Number(value))}
                            readonly={profile.memberships.length === 1}
                        />
                    </View>
                </View>
                <Spacer size={32} />
                <View style={styles.menuCard}>
                    <View style={styles.row}>
                        <CardButton
                            radius="small"
                            active={false}
                            onPress={onNavigateDrivenHunt}
                            style={styles.cardButton}
                            label={t("hunt.drivenHunt.hunt")}
                            iconName="hound"
                        />
                        <CardButton
                            radius="small"
                            active={false}
                            onPress={onNavigateIndividualHunt}
                            style={styles.cardButton}
                            label={t("hunt.individualHunt.hunt")}
                            iconName="huntTarget"
                        />
                    </View>
                    {huntActivitiesCount > 0 || hasPermissionToRegisterHunt ? (
                        <View style={styles.row}>
                            {huntActivitiesCount > 0 ? (
                                <CardButton
                                    badgeCount={pendingHuntActivitiesCount}
                                    radius="small"
                                    active={false}
                                    onPress={onNavigateActivitiesList}
                                    style={styles.cardButton}
                                    label={t("hunt.huntActivitiesList.title")}
                                    iconName="tracking"
                                />
                            ) : null}
                            {hasPermissionToRegisterHunt ? (
                                <CardButton
                                    badgeCount={injuredAnimalsCount}
                                    radius="small"
                                    active={false}
                                    onPress={onNavigateRegisterPrey}
                                    style={styles.cardButton}
                                    label={t("hunt.registerPrey")}
                                    iconName="register"
                                />
                            ) : null}
                        </View>
                    ) : null}
                </View>
            </View>
        </ScreenBackgroundLayout>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 16,
    },
    body: {
        justifyContent: "space-between",
        flexGrow: 1,
    },
    row: {
        flexDirection: "row",
        gap: 10,
    },
    menuCard: {
        gap: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: theme.color.white,
    },
    cardButton: {
        maxHeight: 82,
        flexGrow: 1,
        aspectRatio: 1,
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    fullWidth: {
        flex: 1,
    },
});
