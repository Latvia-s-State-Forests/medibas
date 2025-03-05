import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { SpeciesField } from "~/components/species-field";
import { theme } from "~/theme";

export function SpeciesFieldExampleScreen() {
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState("");

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Species Field" />
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
                <SpeciesField
                    label="Species"
                    options={[
                        { label: "Moose", value: "value1", iconName: "moose" },
                        { label: "Red deer", value: "value2", iconName: "deer" },
                        { label: "Roe deer", value: "value4", iconName: "roe" },
                        { label: "Wild boar", value: "value5", iconName: "boar" },
                        { label: "Lynx", value: "value6", iconName: "lynx" },
                        { label: "Wolf", value: "value7", iconName: "wolf" },
                        { label: "Beaver", value: "value8", iconName: "beaver" },
                        { label: "European pine marten", value: "value9", iconName: "marten" },
                        { label: "Other mammals", value: "value10", iconName: "fox" },
                        { label: "Birds", value: "value11", iconName: "birds" },
                    ]}
                    value="value1"
                    onChange={ignore}
                />
                <SpeciesField
                    label="Species (dynamic)"
                    options={[
                        { label: "Moose", value: "value1", iconName: "moose" },
                        { label: "Red deer", value: "value2", iconName: "deer" },
                        { label: "Roe deer", value: "value4", iconName: "roe" },
                        { label: "Wild boar", value: "value5", iconName: "boar" },
                        { label: "Lynx", value: "value6", iconName: "lynx" },
                        { label: "Wolf", value: "value7", iconName: "wolf" },
                        { label: "Beaver", value: "value8", iconName: "beaver" },
                        { label: "European pine marten", value: "value9", iconName: "marten" },
                        { label: "Other mammals", value: "value10", iconName: "fox" },
                        { label: "Birds", value: "value11", iconName: "birds" },
                    ]}
                    value={value}
                    onChange={setValue}
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
        paddingVertical: 16,
    },
});
