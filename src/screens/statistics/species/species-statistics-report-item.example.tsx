import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { StatisticsSpeciesItem } from "~/types/statistics";
import { SpeciesStatisticsReportItem } from "./species-statistics-report-item";

export function SpeciesStatisticsReportItemExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {}

    // Mock data for different examples
    const limitedSpeciesItem: StatisticsSpeciesItem = {
        animalObservationId: 1,
        huntReportId: 101,
        speciesId: 1,
        huntedTime: "2024-01-15T10:30:00Z",
        notes: "Test note 1",
        permitTypeId: 1,
        location: [24.1051, 56.9494],
        huntSeason: "2023-2024",
        strapNumber: "STR001",
        districtId: 5,
        genderId: 1,
        ageId: 1,
        count: 1,
        hasSignsOfDisease: false,
    };

    const unlimitedSpeciesItem: StatisticsSpeciesItem = {
        animalObservationId: 804,
        huntReportId: 202,
        speciesId: 9,
        huntedTime: "2024-02-20T12:00:00Z",
        notes: "Unlimited species note",
        permitTypeId: 99,
        location: [24.5051, 56.5494],
        huntSeason: "2023-2024",
        strapNumber: undefined,
        districtId: 7,
        genderId: 1,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: false,
    };

    const limitedUnlimitedSpeciesItem: StatisticsSpeciesItem = {
        animalObservationId: 803,
        huntReportId: 303,
        speciesId: 4,
        huntedTime: "2024-03-10T09:15:00Z",
        notes: "Limited/Unlimited note",
        permitTypeId: 10,
        location: [24.4051, 56.6494],
        huntSeason: "2023-2024",
        strapNumber: "STR002",
        districtId: 8,
        genderId: 2,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: true,
    };

    return (
        <View style={styles.container}>
            <Header title="Species Statistics Report Item" />
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
                <Text>Limited Species Report</Text>
                <Spacer size={8} />
                <SpeciesStatisticsReportItem statisticsItem={limitedSpeciesItem} onPress={ignore} />

                <Spacer size={16} />
                <Text>Unlimited Species Report</Text>
                <Spacer size={8} />
                <SpeciesStatisticsReportItem statisticsItem={unlimitedSpeciesItem} onPress={ignore} />

                <Spacer size={16} />
                <Text>Limited/Unlimited Species Report</Text>
                <Spacer size={8} />
                <SpeciesStatisticsReportItem statisticsItem={limitedUnlimitedSpeciesItem} onPress={ignore} />
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
