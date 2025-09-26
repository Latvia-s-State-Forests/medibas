import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { NavigationButtonField } from "~/components/navigation-button-field";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function NavigationButtonFieldExampleScreen() {
    const insets = useSafeAreaInsets();
    const latitude = 56.96767;
    const longitude = 23.77085;

    return (
        <View style={styles.container}>
            <Header title="Navigation Button Field" />
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
                <NavigationButtonField
                    label="Coordinates (Read-only)"
                    value={`${latitude}, ${longitude}`}
                    latitude={latitude}
                    longitude={longitude}
                    locationLabel="2425-0001 Concluded Hunt"
                    hideNavigationButton={true}
                />
                <Spacer size={16} />
                <NavigationButtonField
                    label="Coordinates with navigation button"
                    value={`${latitude}, ${longitude}`}
                    latitude={latitude}
                    longitude={longitude}
                    locationLabel="2425-0001 Meeting Point"
                />

                <Spacer size={16} />
                <NavigationButtonField
                    label="Location with very long description that should wrap properly"
                    value={`This is a very long coordinate description that demonstrates text wrapping behavior on small screens. Coordinates: ${latitude}, ${longitude}`}
                    latitude={latitude}
                    longitude={longitude}
                    locationLabel="2425-0001 Meeting Point with Long Label"
                />

                <Spacer size={24} />
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
