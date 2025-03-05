import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { RadioButtonList } from "~/components/radio-button-list";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function RadioButtonListExampleScreen() {
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState<string>("");

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Radio Button List" />
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
                <RadioButtonList
                    label="Radio Button List"
                    value={value}
                    onChange={setValue}
                    options={[
                        { label: "Label", value: "value" },
                        { label: "Label", value: "value2" },
                        { label: "Label", value: "value3" },
                        { label: "Label", value: "value4" },
                        { label: "Label", value: "value5" },
                    ]}
                />

                <Spacer size={16} />

                <RadioButtonList
                    label="Radio Button List (disabled)"
                    value="value"
                    onChange={ignore}
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
