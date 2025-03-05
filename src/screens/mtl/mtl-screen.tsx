import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, StyleSheet, View } from "react-native";
import { CardButton } from "~/components/card-button";
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

    useFocusEffect(
        React.useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                queryClient.invalidateQueries(queryKeys.profile);
                queryClient.invalidateQueries(queryKeys.memberships);
            });
        }, [])
    );

    const viewMemberManagement = permissions.viewMemberManagement;

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
                <View style={styles.topCards}>
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
                            <Spacer horizontal size={8} />
                            <CardButton
                                radius="small"
                                active={false}
                                onPress={() => {
                                    if (viewMemberManagement) {
                                        navigation.navigate("MemberManagementScreen");
                                    } else if (selectedDistrictId) {
                                        navigation.navigate("DistrictDamagesListScreen", {
                                            districtId: selectedDistrictId,
                                        });
                                    }
                                }}
                                style={styles.cardButton}
                                label={viewMemberManagement ? t("mtl.memberManagement") : t("damage.inDistrict")}
                                iconName={viewMemberManagement ? "members" : "forest"}
                            />
                        </>
                    ) : null}
                </View>
                {viewMemberManagement ? (
                    <CardButton
                        radius="small"
                        active={false}
                        onPress={() => {
                            if (selectedDistrictId) {
                                navigation.navigate("DistrictDamagesListScreen", { districtId: selectedDistrictId });
                            }
                        }}
                        label={t("damage.inDistrict")}
                        iconName="forest"
                    />
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
        gap: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: theme.color.white,
    },
    topCards: {
        flexDirection: "row",
    },
    cardButton: {
        flex: 1,
    },
});
