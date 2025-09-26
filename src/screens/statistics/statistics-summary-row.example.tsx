import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { StatisticsSummaryRow } from "~/screens/statistics/statistics-summary-row";
import { theme } from "~/theme";

export function StatisticsSummaryRowExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // Do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Statistics Summary Row" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <Text>Summary Row with Icon</Text>
                <Spacer size={8} />
                <StatisticsSummaryRow title="Wild Boar" count={15} iconName="animals" onPress={ignore} />

                <Spacer size={16} />
                <Text>Summary Row without Icon</Text>
                <Spacer size={8} />
                <StatisticsSummaryRow title="Hunts" count={8} onPress={ignore} />

                <Spacer size={16} />
                <Text>Summary Row with High Count</Text>
                <Spacer size={8} />
                <StatisticsSummaryRow title="Deer" count={142} iconName="deer" onPress={ignore} />

                <Spacer size={16} />
                <Text>Summary Row with Zero Count</Text>
                <Spacer size={8} />
                <StatisticsSummaryRow title="Bear" count={0} iconName="bear" onPress={ignore} />

                <Spacer size={16} />
                <Text>Summary Row with Different Icon</Text>
                <Spacer size={8} />
                <StatisticsSummaryRow title="Protected Species" count={3} iconName="deer" onPress={ignore} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingTop: 24,
    },
});
