import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { RadioButtonGrid } from "~/components/radio-button-grid";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function RadioButtonGridExampleScreen() {
    const insets = useSafeAreaInsets();

    const [value, setValue] = React.useState<string>("");

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Radio Button Grid" />
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
                <RadioButtonGrid
                    label="Radio Button Grid"
                    onChange={setValue}
                    value={value}
                    options={[
                        { label: "Label", value: "value" },
                        { label: "Label", value: "value2" },
                        { label: "Label", value: "value3" },
                        { label: "Label", value: "value4" },
                        { label: "Label", value: "value5" },
                    ]}
                />
                <Spacer size={16} />

                <RadioButtonGrid
                    label="Radio Button Grid (disabled)"
                    onChange={ignore}
                    value={"value"}
                    options={[
                        { label: "Label", value: "value" },
                        { label: "Label", value: "value2" },
                        { label: "Label", value: "value3" },
                        { label: "Label", value: "value4" },
                        { label: "Label", value: "value5" },
                    ]}
                    disabled
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
