import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { SpeciesStatisticsReportItem } from "~/screens/statistics/species/species-statistics-report-item";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { StatisticsSpeciesItem } from "~/types/statistics";

type SpeciesStatisticsListScreenProps = NativeStackScreenProps<RootNavigatorParams, "SpeciesStatisticsListScreen">;

export function SpeciesStatisticsListScreen(props: SpeciesStatisticsListScreenProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { speciesName, speciesType, selectedSeason, filteredItems } = props.route.params;

    const speciesData = React.useMemo(() => {
        return filteredItems
            .slice()
            .sort((a, b) => new Date(b.huntedTime).getTime() - new Date(a.huntedTime).getTime());
    }, [filteredItems]);

    function renderItem({ item }: { item: StatisticsSpeciesItem }) {
        return (
            <SpeciesStatisticsReportItem
                statisticsItem={item}
                onPress={() =>
                    props.navigation.navigate("SpeciesStatisticsDetailScreen", {
                        statisticsItem: item,
                        speciesName,
                        speciesType,
                    })
                }
            />
        );
    }

    function renderHeader() {
        return (
            <>
                <Spacer size={24} />
                <Text style={styles.text}>{t("statistics.huntedAnimalsInSeason", { season: selectedSeason })}</Text>
                <Spacer size={24} />
            </>
        );
    }

    return (
        <View style={styles.container}>
            <Header title={speciesName} />

            <FlatList
                data={speciesData}
                renderItem={renderItem}
                keyExtractor={(item) => item.animalObservationId.toString()}
                ListHeaderComponent={renderHeader}
                ItemSeparatorComponent={() => <Spacer size={8} />}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    text: {
        textAlign: "center",
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 0,
    },
});
