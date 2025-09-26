import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Header } from "~/components/header";
import { useSpeciesStatisticsQuery } from "~/hooks/use-statistics-species-query";
import { theme } from "~/theme";
import { StatisticsEmptyScreen } from "../statistics-empty-screen";
import { StatisticsScreenFailure } from "../statistics-screen-failure";
import { StatisticsScreenLoading } from "../statistics-screen-loading";
import { SpeciesStatisticsScreenLoaded } from "./species-statistics-screen-loaded";

export function SpeciesStatisticsScreen() {
    const { t } = useTranslation();
    const query = useSpeciesStatisticsQuery();

    return (
        <View style={styles.container}>
            <Header title={t("statistics.huntedAnimals")} />
            {query.isLoading ? (
                <StatisticsScreenLoading />
            ) : query.isError || !query.data ? (
                <StatisticsScreenFailure
                    onRetryButtonPress={() => {
                        query.refetch();
                    }}
                />
            ) : !query.data.length ? (
                <StatisticsEmptyScreen type="species" />
            ) : (
                <SpeciesStatisticsScreenLoaded statistics={query.data} />
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
