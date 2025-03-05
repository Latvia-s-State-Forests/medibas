import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { SegmentedControl } from "~/components/segmented-control";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function SegmentedControlExampleScreen() {
    const insets = useSafeAreaInsets();

    const [value, setValue] = React.useState<string>("value");

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Segmented Control" />
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
                <SegmentedControl
                    label="Segmented Control"
                    options={[
                        { label: "Label", value: "value" },
                        { label: "Label", value: "value2" },
                        { label: "Label", value: "value3" },
                    ]}
                    value={value}
                    onChange={setValue}
                />
                <Spacer size={16} />
                <SegmentedControl
                    label="Segmented Control (disabled)"
                    options={[
                        { label: "Label", value: "value" },
                        { label: "Label", value: "value2" },
                        { label: "Label", value: "value3" },
                    ]}
                    value="value"
                    onChange={ignore}
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
