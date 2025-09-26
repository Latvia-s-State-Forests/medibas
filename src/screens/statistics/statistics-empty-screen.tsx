import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { match } from "ts-pattern";
import { EmptyListMessage } from "~/components/empty-list-message";
import { HEADER_HEIGHT } from "~/components/header";

interface StatisticsEmptyScreenProps {
    type: "individual-hunt" | "species" | "driven-hunt";
}

export function StatisticsEmptyScreen(props: StatisticsEmptyScreenProps) {
    const { t } = useTranslation();

    const translationKey = match(props.type)
        .with("individual-hunt", () => "statistics.noHuntsRegistered")
        .with("species", () => "statistics.noHuntedAnimals")
        .with("driven-hunt", () => "statistics.noHuntsRegistered")
        .exhaustive();

    return (
        <View style={styles.content}>
            <EmptyListMessage icon="hunt" label={t(translationKey)} />
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
});
