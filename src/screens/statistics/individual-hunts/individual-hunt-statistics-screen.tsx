import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Header } from "~/components/header";
import { useIndividualHuntStatisticsQuery } from "~/hooks/use-individual-hunt-statistics-query";
import { theme } from "~/theme";
import { StatisticsEmptyScreen } from "../statistics-empty-screen";
import { StatisticsScreenFailure } from "../statistics-screen-failure";
import { StatisticsScreenLoading } from "../statistics-screen-loading";
import { IndividualHuntStatisticsScreenLoaded } from "./individual-hunt-statistics-screen-loaded";

export function IndividualHuntStatisticsScreen() {
    const { t } = useTranslation();
    const query = useIndividualHuntStatisticsQuery();

    return (
        <View style={styles.container}>
            <Header title={t("statistics.individualHunts")} />
            {query.isLoading ? (
                <StatisticsScreenLoading />
            ) : query.isError || !query.data ? (
                <StatisticsScreenFailure
                    onRetryButtonPress={() => {
                        query.refetch();
                    }}
                />
            ) : !query.data.length ? (
                <StatisticsEmptyScreen type="individual-hunt" />
            ) : (
                <IndividualHuntStatisticsScreenLoaded statistics={query.data} />
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
