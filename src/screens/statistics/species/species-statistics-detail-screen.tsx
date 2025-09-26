import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { SpeciesStatisticsDetailFields } from "./species-statistics-detail-fields";

type SpeciesStatisticsDetailScreenProps = NativeStackScreenProps<RootNavigatorParams, "SpeciesStatisticsDetailScreen">;

export function SpeciesStatisticsDetailScreen(props: SpeciesStatisticsDetailScreenProps) {
    const { statisticsItem, speciesName, speciesType } = props.route.params;

    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Header title={speciesName} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <SpeciesStatisticsDetailFields
                    statisticsItem={statisticsItem}
                    speciesName={speciesName}
                    speciesType={speciesType}
                />
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
