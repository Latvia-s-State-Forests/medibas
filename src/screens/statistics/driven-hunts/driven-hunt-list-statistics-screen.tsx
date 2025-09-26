import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { HuntingCard } from "~/components/hunting-card";
import { Spacer } from "~/components/spacer";
import { HuntListStatisticsHeader } from "~/screens/statistics/statistics-list-header";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { DrivenHuntStatisticsItem } from "~/types/statistics";
import { formatHuntDate } from "~/utils/format-date-time";

type DrivenHuntListStatisticsScreenProps = NativeStackScreenProps<
    RootNavigatorParams,
    "DrivenHuntListStatisticsScreen"
>;

export function DrivenHuntListStatisticsScreen({ route, navigation }: DrivenHuntListStatisticsScreenProps) {
    const insets = useSafeAreaInsets();
    const { huntPlaceName, selectedSeason, filterType = "all", filteredHunts } = route.params;

    const huntData = React.useMemo(() => {
        return filteredHunts
            .slice()
            .sort((a, b) => new Date(b.plannedFrom).getTime() - new Date(a.plannedFrom).getTime());
    }, [filteredHunts]);

    function renderHuntingCard({ item }: { item: DrivenHuntStatisticsItem }) {
        const date = formatHuntDate(item.plannedFrom, item.plannedTo);

        const districtNames = item.districts
            .map((district) => district.descriptionLv.trim())
            .sort((a, b) => a.localeCompare(b))
            .join(", ");

        const title = `${item.huntEventCode}, ${districtNames}`;

        return (
            <HuntingCard
                date={date}
                title={title}
                name={item.huntManagerName}
                onPress={() => {
                    navigation.navigate("DrivenHuntStatisticsDetailScreen", {
                        statisticsItem: item,
                    });
                }}
            />
        );
    }

    return (
        <View style={styles.container}>
            <Header title={huntPlaceName} />

            <FlatList
                data={huntData}
                renderItem={renderHuntingCard}
                keyExtractor={(item) => String(item.huntEventId)}
                ListHeaderComponent={() => (
                    <HuntListStatisticsHeader place={huntPlaceName} season={selectedSeason} filterType={filterType} />
                )}
                ItemSeparatorComponent={() => <Spacer size={8} />}
                contentContainerStyle={[
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
});
