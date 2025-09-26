import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { StatisticsHuntInfoCard } from "./statistics-hunt-info-card";

export function StatisticsHuntInfoCardExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // Do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Statistics Hunt Info Card Examples" />

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Spacer size={24} />

                <Text>Basic Cards</Text>
                <Spacer size={16} />

                {/* Card with count and chevron */}
                <StatisticsHuntInfoCard title="Total Hunts" count={15} value="15 hunts" onPress={ignore} />

                <Spacer size={12} />

                {/* Card without count (no chevron) */}
                <StatisticsHuntInfoCard title="Total Time Spent" value="24h 30min" onPress={ignore} />

                <Spacer size={32} />

                <Text>Hunt Results</Text>
                <Spacer size={16} />

                <View style={styles.row}>
                    {/* Card with animals */}
                    <StatisticsHuntInfoCard title="With game" count={8} value="8 (53%)" onPress={ignore} />

                    <Spacer horizontal size={12} />

                    {/* Card without animals */}
                    <StatisticsHuntInfoCard title="Without game" count={7} value="7 (47%)" onPress={ignore} />
                </View>

                <Spacer size={32} />

                <Text>Disabled cards</Text>
                <Spacer size={16} />

                {/* Disabled card with count 0 */}
                <StatisticsHuntInfoCard
                    title="Failed Hunts"
                    count={0}
                    value="0 hunts"
                    disabled={true}
                    onPress={ignore}
                />

                <Spacer size={12} />

                <StatisticsHuntInfoCard title="With game" count={0} value="0 (0%)" onPress={ignore} />

                <Spacer size={12} />

                {/* Card without animals */}
                <StatisticsHuntInfoCard title="Without game" count={0} value="0 (0%)" onPress={ignore} />

                <Spacer size={12} />

                {/* Card with time and no count (should also be disabled) */}
                <StatisticsHuntInfoCard title="Average Hunt Duration" value="1h 38min" onPress={ignore} />
            </ScrollView>
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
    row: {
        flexDirection: "row",
    },
});
