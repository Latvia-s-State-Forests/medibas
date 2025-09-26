import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { HEADER_HEIGHT } from "~/components/header";
import { LargestIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type StatisticsScreenFailureProps = {
    onRetryButtonPress: () => void;
};

export function StatisticsScreenFailure(props: StatisticsScreenFailureProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.content}>
            <LargestIcon name="failure" />
            <Spacer size={24} />
            <Text size={22} weight="bold" style={styles.text}>
                {t("statistics.status.error")}
            </Text>
            <Spacer size={24} />
            <Button title={t("general.retry")} onPress={props.onRetryButtonPress} style={styles.button} />
        </View>
    );
}

const styles = StyleSheet.create({
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
    button: {
        alignSelf: "stretch",
    },
});
