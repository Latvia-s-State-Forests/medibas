import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { HEADER_HEIGHT } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function StatisticsScreenLoading() {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Spinner />
                <Spacer size={24} />
                <Text size={22} weight="bold" style={styles.text}>
                    {t("statistics.status.loading")}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: HEADER_HEIGHT,
    },
    text: {
        textAlign: "center",
    },
});
