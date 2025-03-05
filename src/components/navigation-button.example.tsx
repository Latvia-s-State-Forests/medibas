import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { theme } from "~/theme";
import { NavigationButton } from "./navigation-button";
import { ReadOnlyField } from "./read-only-field";
import { Spacer } from "./spacer";
import { Text } from "./text";

export function NavigationButtonExampleScreen() {
    const insets = useSafeAreaInsets();
    const latitude = 56.96767;
    const longitude = 23.77085;

    return (
        <View style={styles.container}>
            <Header title="Navigation Button" />
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
                <Text>Navigation Button</Text>
                <Spacer size={16} />
                <View style={styles.navigation}>
                    <ReadOnlyField label={"Coordinates"} value={`${latitude}, ${longitude}`} />
                    <Spacer size={8} />
                    <NavigationButton
                        latitude={latitude}
                        longitude={longitude}
                        locationLabel="2425-0001 Tikšanās vieta"
                    />
                </View>
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
    navigation: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});
