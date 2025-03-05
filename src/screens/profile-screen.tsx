import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Collapsible } from "~/components/collapsible/collapsible";
import { Dialog } from "~/components/dialog";
import { FullNameField } from "~/components/full-name-field";
import { Header } from "~/components/header";
import { SmallIcon } from "~/components/icon";
import { LogoutButton } from "~/components/logout-button";
import { QRContainer } from "~/components/qr-code/qr-container";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { VmdConnectStatusDialog } from "~/components/vmd-connect-status-dialog";
import { useProfile } from "~/hooks/use-profile";
import { AuthAction, useUserStorage } from "~/machines/authentication-machine";
import { vmdConnectMachine } from "~/machines/vmd-machine";
import { theme } from "~/theme";
import { HunterCardTypeId } from "~/types/classifiers";
import { ProfileQrCode } from "~/types/profile";
import { getValidHunterCardNumber } from "~/utils/profile";

export function ProfileScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const profile = useProfile();
    const userStorage = useUserStorage();
    const hunterCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Hunter);
    const huntManagerCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.HuntManager);
    const seasonCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Season);
    const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);
    const hasVMD = profile.vmdId !== "" && profile.vmdId !== undefined;
    const { t } = useTranslation();
    const vmdConnectService = useInterpret(() => vmdConnectMachine);

    const profileName = userStorage.getProfileName();
    const firstName = profile.firstName ?? profileName?.firstName ?? "";
    const lastName = profile.lastName ?? profileName?.lastName ?? "";
    const qrCode: ProfileQrCode = {
        uid: profile.id,
        pid: profile.personId,
        fn: firstName,
        ln: lastName,
        cn: profile.validHuntersCardNumber,
        sc: profile.isHunter ? (seasonCardNumber ? true : false) : undefined,
    };
    const qrCodeValue = JSON.stringify(qrCode);

    const huntingDistrictTrustee = profile.memberships
        .filter((membership) => membership.isTrustee)
        .map((membership) => membership.huntingDistrict.descriptionLv.trim())
        .join(", ");
    const huntingDistrictMember = profile.memberships
        .filter((membership) => membership.isMember)
        .map((membership) => membership.huntingDistrict.descriptionLv.trim())
        .join(", ");

    function onLogoutConfirmed() {
        setShowConfirmLogout(false);
        AuthAction.logout();
    }
    const qrDescription = `${firstName} ${lastName} ${hunterCardNumber ? hunterCardNumber : ""}`;
    const windowWidth = Dimensions.get("window").width;
    const qrCodeSize = 0.25 * windowWidth;
    const rightPadding = qrCodeSize + 32;
    const hasFullName = firstName !== "" && lastName !== "";

    return (
        <View style={styles.container}>
            <Header
                showEditButton={!hasVMD && hasFullName}
                title={t("profile.title")}
                onEditButtonPress={() => navigation.navigate("EditProfileScreen")}
            />
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
                <View style={styles.qrCodeRow}>
                    <ReadOnlyField label={t("profile.userIdentifier")} value={String(profile.id)} />
                    {firstName && lastName ? (
                        <QRContainer
                            title={t("qrcode.title.profile")}
                            description={qrDescription}
                            value={qrCodeValue}
                        />
                    ) : null}
                </View>
                <Spacer size={18} />
                <FullNameField
                    firstName={firstName}
                    lastName={lastName}
                    hasVMD={hasVMD}
                    onAddMorePress={() => navigation.navigate("EditProfileScreen")}
                    rightPadding={rightPadding}
                />
                {hunterCardNumber ? (
                    <>
                        <Spacer size={18} />
                        <ReadOnlyField label={t("hunt.huntersLicenseNumber")} value={hunterCardNumber} />
                    </>
                ) : null}
                {huntManagerCardNumber ? (
                    <>
                        <Spacer size={18} />
                        <ReadOnlyField label={t("hunt.huntManagersLicenseNumber")} value={huntManagerCardNumber} />
                    </>
                ) : null}
                {profile.isHunter ? (
                    <>
                        <Spacer size={18} />
                        <ReadOnlyField
                            label={t("hunt.huntersSeasonCard")}
                            value={seasonCardNumber ? t("hunt.huntCardValid") : t("hunt.huntCardInvalid")}
                            icon={
                                <SmallIcon
                                    name={seasonCardNumber ? "valid" : "notValid"}
                                    color={seasonCardNumber ? "success" : "error"}
                                />
                            }
                        />
                        {huntingDistrictTrustee && (
                            <>
                                <Spacer size={18} />
                                <ReadOnlyField
                                    label={t("hunt.huntingDistrictTrustee")}
                                    value={huntingDistrictTrustee}
                                />
                            </>
                        )}
                        {huntingDistrictMember && (
                            <>
                                <Spacer size={18} />
                                <ReadOnlyField label={t("hunt.huntingDistrictMember")} value={huntingDistrictMember} />
                            </>
                        )}
                    </>
                ) : null}
                {profile.vmdId ? (
                    <>
                        <Spacer size={10} />
                        <Collapsible lastInList title={t("profile.moreOptions")}>
                            <Button
                                variant="link"
                                title={t("profile.connectVmdAccount")}
                                onPress={() => vmdConnectService.send("CONNECT")}
                                style={styles.vmdConnectButton}
                            />
                        </Collapsible>
                    </>
                ) : (
                    <>
                        <Spacer size={18} />
                        <Button
                            variant="link"
                            title={t("profile.connectVmdAccount")}
                            onPress={() => vmdConnectService.send("CONNECT")}
                            style={styles.vmdConnectButton}
                        />
                    </>
                )}
                <Spacer size={24} />
            </ScrollView>

            <LogoutButton onPress={() => setShowConfirmLogout(true)} title={t("menu.exit.button")} />

            <Dialog
                visible={showConfirmLogout}
                icon="lock"
                title={t("menu.exit.title")}
                buttons={
                    <>
                        <Button title={t("menu.exit.button")} onPress={onLogoutConfirmed} />
                        <Button
                            title={t("modal.cancel")}
                            variant="secondary-outlined"
                            onPress={() => setShowConfirmLogout(false)}
                        />
                    </>
                }
                onBackButtonPress={() => setShowConfirmLogout(false)}
            />

            <VmdConnectStatusDialog service={vmdConnectService} />
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
    qrCodeRow: {
        position: "relative",
        zIndex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    vmdConnectButton: {
        paddingLeft: 0,
        borderBottomColor: theme.color.gray2,
        borderBottomWidth: 1,
        backgroundColor: theme.color.background,
        justifyContent: "flex-start",
    },
});
