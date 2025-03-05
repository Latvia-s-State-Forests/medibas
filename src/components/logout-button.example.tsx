import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Header } from "~/components/header";
import { LogoutButton } from "~/components/logout-button";
import { theme } from "~/theme";

export function LogoutButtonExampleScreen() {
    const { t } = useTranslation();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Logout Button" />
            <View style={styles.flex}></View>
            <LogoutButton onPress={ignore} title={t("menu.exit.button")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    flex: {
        flex: 1,
    },
});
