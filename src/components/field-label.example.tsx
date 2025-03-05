import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FieldLabel } from "~/components/field-label";
import { Header } from "~/components/header";
import { theme } from "~/theme";
import { FieldLabelWithBadge } from "./field-label-with-badge";

export function FieldLabelExampleScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Header title="Field Label" />
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
                <View style={styles.contentContainer}>
                    <FieldLabel label="Field label" />
                    <FieldLabelWithBadge count={5} label="Field label with badge" />
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
    contentContainer: {
        gap: 16,
    },
});
