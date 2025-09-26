import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Header } from "~/components/header";
import { useDrivenHuntStatisticsQuery } from "~/hooks/use-driven-hunt-statistics-query";
import { theme } from "~/theme";
import { StatisticsEmptyScreen } from "../statistics-empty-screen";
import { StatisticsScreenFailure } from "../statistics-screen-failure";
import { StatisticsScreenLoading } from "../statistics-screen-loading";
import { DrivenHuntStatisticsScreenLoaded } from "./driven-hunt-statistics-screen-loaded";

export function DrivenHuntStatisticsScreen() {
    const { t } = useTranslation();
    const query = useDrivenHuntStatisticsQuery();

    return (
        <View style={styles.container}>
            <Header title={t("statistics.drivenHunts")} />
            {query.isLoading ? (
                <StatisticsScreenLoading />
            ) : query.isError || !query.data ? (
                <StatisticsScreenFailure
                    onRetryButtonPress={() => {
                        query.refetch();
                    }}
                />
            ) : !query.data.length ? (
                <StatisticsEmptyScreen type="driven-hunt" />
            ) : (
                <DrivenHuntStatisticsScreenLoaded statistics={query.data} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
});
