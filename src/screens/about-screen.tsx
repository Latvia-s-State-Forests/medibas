import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image, Linking, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Header } from "~/components/header";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { logger } from "~/logger";
import { theme } from "~/theme";
import { getAppVersion } from "~/utils/get-app-version";

export function AboutScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [isVisible, setIsVisible] = React.useState(false);
    const [isShareLogsInProgress, setIsShareLogsInProgress] = React.useState(false);

    function onModalClose() {
        setIsVisible(false);
    }

    function onTermsAndConditionsPress() {
        WebBrowser.openBrowserAsync(configuration.support.termsOfUseUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            createTask: false,
        });
    }

    function onPrivacyPolicyPress() {
        WebBrowser.openBrowserAsync(configuration.support.privacyPolicyUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
            createTask: false,
        });
    }

    function onContactUsPress() {
        Linking.openURL("mailto:" + configuration.support.supportEmail);
    }

    function onLicensesPress() {
        navigation.navigate("LicenseListScreen");
    }

    function onShareLogsPress() {
        setIsShareLogsInProgress(true);
        logger
            .share()
            .catch((error) => {
                logger.error("Failed to share logs", error);
                setIsVisible(true);
            })
            .finally(() => {
                setIsShareLogsInProgress(false);
            });
    }

    const version = getAppVersion();

    return (
        <>
            <View style={styles.container}>
                <Header title={t("about.title")} />
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
                    <Text>{t("about.description")}</Text>
                    <Spacer size={24} />
                    <Text>{t("about.euSupportNotice")}</Text>
                    <Spacer size={24} />
                    <Image source={require("../assets/images/elfla-logo.jpeg")} style={styles.image} />
                    <Spacer size={24} />
                    <View style={styles.margin}>
                        <PressableListItem background="white" onPress={onContactUsPress} label={t("about.contactUs")} />
                        <PressableListItem
                            background="white"
                            onPress={onTermsAndConditionsPress}
                            label={t("about.termsOfUse")}
                        />
                        <PressableListItem
                            background="white"
                            onPress={onPrivacyPolicyPress}
                            label={t("about.privacyPolicy")}
                        />
                        <PressableListItem background="white" onPress={onLicensesPress} label={t("about.licenses")} />
                        <PressableListItem
                            background="white"
                            onPress={onShareLogsPress}
                            label={t("about.debugInfo.title")}
                            disabled={isShareLogsInProgress}
                        />
                    </View>
                    <Spacer size={24} />
                    <Text style={styles.textAlign}>{t("about.appVersion", { version })}</Text>
                </ScrollView>
            </View>
            <Dialog
                visible={isVisible}
                icon="failure"
                title={t("about.debugInfo.failure.title")}
                buttons={<Button title={t("modal.close")} onPress={onModalClose} />}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    textAlign: {
        textAlign: "center",
    },
    image: {
        resizeMode: "contain",
        width: "100%",
        height: 100,
    },
    margin: {
        marginHorizontal: -16,
    },
});
