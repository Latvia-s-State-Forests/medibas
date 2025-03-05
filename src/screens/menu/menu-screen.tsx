import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { useUnsyncedReportsCount } from "~/components/reports-provider";
import { useNews } from "~/hooks/use-news";
import { theme } from "~/theme";
import { MenuListItem } from "./menu-list-item";

export function MenuScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const unSyncedChangesCount = useUnsyncedReportsCount();

    const { unreadNewsCount } = useNews();

    return (
        <View style={styles.container}>
            <Header title="Mednis" />
            <ScrollView style={{ paddingBottom: insets.bottom + 24 }}>
                <MenuListItem
                    onPress={() => navigation.navigate("ProfileScreen", {})}
                    title={t("menu.profile")}
                    icon="user"
                />
                <MenuListItem
                    onPress={() => navigation.navigate("ReportListScreen")}
                    title={t("menu.reports")}
                    count={unSyncedChangesCount}
                    icon="register"
                />
                <MenuListItem
                    onPress={() => navigation.navigate("NewsScreen")}
                    count={unreadNewsCount}
                    title={t("menu.news.title")}
                    icon="envelope"
                    hasNews
                />
                <MenuListItem
                    onPress={() => navigation.navigate("SettingsScreen")}
                    title={t("menu.settings")}
                    icon="settings"
                />
                <MenuListItem
                    onPress={() => navigation.navigate("AboutScreen")}
                    title={t("menu.aboutApp")}
                    icon="info"
                />
                {__DEV__ ? (
                    <MenuListItem
                        onPress={() =>
                            navigation.navigate("ComponentExamplesNavigator", { screen: "ComponentExamplesListScreen" })
                        }
                        title="Component showcase"
                        icon="mapLayers"
                    />
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
});
