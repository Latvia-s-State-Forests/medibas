import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, StyleSheet, View } from "react-native";
import { CardButton } from "~/components/card-button";
import { usePendingInfrastructureChangesCount } from "~/components/infrastructure-provider";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { Select } from "~/components/select";
import { SettingsButton } from "~/components/settings-button";
import { Spacer } from "~/components/spacer";
import { usePermissions } from "~/hooks/use-permissions";
import { useProfile } from "~/hooks/use-profile";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";

export function MTLScreen() {
    const navigation = useNavigation();
    const profile = useProfile();
    const [selectedDistrictId, setSelectedDistrictId] = useSelectedDistrictId();
    const { t } = useTranslation();
    const permissions = usePermissions();
    const pendingInfrastructureChangesCount = usePendingInfrastructureChangesCount();

    useFocusEffect(
        React.useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.profile });
                queryClient.invalidateQueries({ queryKey: queryKeys.memberships });
            });
        }, [])
    );

    const hasPermissionToViewMemberManagement = permissions.viewMemberManagement;
    const hasPermissionToViewInfrastructures = permissions.viewInfrastructures;

    return (
        <ScreenBackgroundLayout style={styles.container}>
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
            <View style={styles.mainCardContainer}>
                <View style={styles.cards}>
                    <CardButton
                        radius="small"
                        active={false}
                        onPress={() => navigation.navigate("PermitsScreen")}
                        style={styles.cardButton}
                        label={t("mtl.permits")}
                        iconName="tag"
                    />
                    {permissions.viewDistrictDamages ? (
                        <>
                            <CardButton
                                radius="small"
                                active={false}
                                onPress={() => {
                                    if (hasPermissionToViewMemberManagement) {
                                        navigation.navigate("MemberManagementScreen");
                                    } else if (selectedDistrictId) {
                                        navigation.navigate("DistrictDamagesListScreen", {
                                            districtId: selectedDistrictId,
                                        });
                                    }
                                }}
                                style={styles.cardButton}
                                label={
                                    hasPermissionToViewMemberManagement
                                        ? t("mtl.memberManagement")
                                        : t("damage.inDistrict")
                                }
                                iconName={hasPermissionToViewMemberManagement ? "members" : "forest"}
                            />
                        </>
                    ) : null}
                </View>
                {hasPermissionToViewInfrastructures || hasPermissionToViewMemberManagement ? (
                    <View style={styles.cards}>
                        {hasPermissionToViewMemberManagement ? (
                            <CardButton
                                style={styles.cardButton}
                                radius="small"
                                active={false}
                                onPress={() => {
                                    if (selectedDistrictId) {
                                        navigation.navigate("DistrictDamagesListScreen", {
                                            districtId: selectedDistrictId,
                                        });
                                    }
                                }}
                                label={t("damage.inDistrict")}
                                iconName="forest"
                            />
                        ) : null}
                        {hasPermissionToViewInfrastructures ? (
                            <CardButton
                                style={styles.cardButton}
                                radius="small"
                                active={false}
                                onPress={() => {
                                    if (selectedDistrictId) {
                                        navigation.navigate("DistrictInfrastructureListScreen", {
                                            districtId: selectedDistrictId,
                                        });
                                    }
                                }}
                                label={t("mtl.infrastructure.districtInfrastructure")}
                                iconName="infrastructure"
                                badgeCount={pendingInfrastructureChangesCount}
                            />
                        ) : null}
                    </View>
                ) : null}
            </View>
        </ScreenBackgroundLayout>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingBottom: 16,
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    fullWidth: {
        flex: 1,
    },
    mainCardContainer: {
        gap: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: theme.color.white,
    },
    cards: {
        flexDirection: "row",
        gap: 10,
    },
    cardButton: {
        flex: 1,
    },
});
