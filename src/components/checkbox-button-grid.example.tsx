import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckboxButtonGrid } from "~/components/checkbox-button-grid";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function CheckboxButtonGridExampleScreen() {
    const insets = useSafeAreaInsets();
    const [checkedValues, setCheckedValues] = React.useState<string[]>([]);

    return (
        <View style={styles.container}>
            <Header title="Checkbox Button Grid" />
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
                <CheckboxButtonGrid
                    label="Checkbox Button Grid"
                    checkedValues={checkedValues}
                    onChange={setCheckedValues}
                    options={[
                        { label: "Label", value: "value" },
                        { label: "Label", value: "value2" },
                        { label: "Label", value: "value3" },
                        { label: "Label", value: "value4" },
                        { label: "Label", value: "value5" },
                    ]}
                />

                <Spacer size={16} />

                <CheckboxButtonGrid
                    label="Checkbox Button Grid (disabled)"
                    checkedValues={["value", "value2", "value3"]}
                    onChange={() => {
                        // do nothing
                    }}
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
