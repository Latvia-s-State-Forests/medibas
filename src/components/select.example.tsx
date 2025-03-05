import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function SelectExampleScreen() {
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState("");

    function ignore() {
        // ignore
    }

    return (
        <View style={styles.container}>
            <Header title="Select" />
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
                <Select
                    label="Select (with value)"
                    options={[
                        { label: "Value1", value: "value1" },
                        { label: "Value2", value: "value2" },
                        { label: "Value3", value: "value3" },
                        { label: "Value4", value: "value4" },
                        { label: "Value5", value: "value5" },
                    ]}
                    value="value1"
                    onChange={ignore}
                />
                <Spacer size={16} />
                <Select
                    label="Select (disabled, with value)"
                    options={[{ label: "Value1", value: "value1" }]}
                    value="value1"
                    onChange={ignore}
                    disabled
                />
                <Spacer size={16} />
                <Select
                    label="Select (no value)"
                    options={[
                        { label: "Value1", value: "value1" },
                        { label: "Value2", value: "value2" },
                        { label: "Value3", value: "value3" },
                        { label: "Value4", value: "value4" },
                        { label: "Value5", value: "value5" },
                    ]}
                    value=""
                    onChange={ignore}
                />
                <Spacer size={16} />
                <Select label="Select (disabled, no value)" disabled options={[]} value="" onChange={ignore} />
                <Spacer size={16} />
                <Select
                    label="Select (show example of truncating very long text)"
                    options={[
                        { label: "Value1", value: "value1" },
                        { label: "Value2", value: "value2" },
                        { label: "Value3", value: "value3" },
                        { label: "Value4", value: "value4" },
                        { label: "Value5", value: "value5" },
                    ]}
                    value=""
                    onChange={ignore}
                />
                <Spacer size={16} />
                <Select
                    clearable
                    label="Select (clearable)"
                    options={[
                        { label: "Value1", value: "value1" },
                        { label: "Value2", value: "value2" },
                        { label: "Value3", value: "value3" },
                        { label: "Value4", value: "value4" },
                        { label: "Value5", value: "value5" },
                    ]}
                    value=""
                    onChange={ignore}
                />
                <Spacer size={16} />
                <Select
                    label="Select (dynamic)"
                    options={[
                        { label: "Value1", value: "value1" },
                        { label: "Value2", value: "value2" },
                        { label: "Value3", value: "value3" },
                        { label: "Value4", value: "value4" },
                        { label: "Value5", value: "value5" },
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
        paddingTop: 24,
    },
});
