import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { IndividualHuntingCard } from "~/components/individual-hunting-card";
import { Spacer } from "~/components/spacer";
import { HuntListStatisticsHeader } from "~/screens/statistics/statistics-list-header";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { IndividualHuntStatisticsItem } from "~/types/statistics";
import { formatHuntDate } from "~/utils/format-date-time";
import { useGetHuntPlaceName } from "../../../utils/get-hunt-place-name";

type IndividualHuntListStatisticsScreenProps = NativeStackScreenProps<
    RootNavigatorParams,
    "IndividualHuntListStatisticsScreen"
>;

export function IndividualHuntListStatisticsScreen(props: IndividualHuntListStatisticsScreenProps) {
    const insets = useSafeAreaInsets();
    const { huntPlaceName, selectedSeason, filterType = "all", filteredHunts, huntEventPlaceId } = props.route.params;
    const getPlaceName = useGetHuntPlaceName();

    const huntData = React.useMemo(() => {
        return filteredHunts
            .slice()
            .sort((a, b) => new Date(b.plannedFrom).getTime() - new Date(a.plannedFrom).getTime());
    }, [filteredHunts]);

    function renderItem({ item }: { item: IndividualHuntStatisticsItem }) {
        const date = formatHuntDate(item.plannedFrom, item.plannedTo);

        const title = `${item.huntEventCode}`;

        const placeName = getPlaceName(item.huntEventPlaceId);
        const firstDistrict = item.districts[0]?.descriptionLv ?? "";
        const description = firstDistrict ? `${placeName}, ${firstDistrict}` : placeName;

        return (
            <IndividualHuntingCard
                date={date}
                hunterName={item.hunters?.[0]?.fullName ?? ""}
                title={title}
                description={description}
                onPress={() => {
                    props.navigation.navigate("IndividualHuntStatisticsDetailScreen", {
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
                renderItem={renderItem}
                keyExtractor={(item) => item.huntEventId.toString()}
                ListHeaderComponent={() => (
                    <HuntListStatisticsHeader
                        place={getPlaceName(huntEventPlaceId, true)}
                        season={selectedSeason}
                        filterType={filterType}
                    />
                )}
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
    scrollContent: {
        flexGrow: 1,
        paddingTop: 0,
    },
});
