import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DynamicPicker } from "~/components/dynamic-picker";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function DynamicPickerExampleScreen() {
    const insets = useSafeAreaInsets();
    const [twoValues, setTwoValues] = React.useState("value");
    const [threeValues, setThreeValues] = React.useState("value");
    const [fourValues, setFourValues] = React.useState("value");
    const [sevenValues, setSevenValues] = React.useState("value");
    const [disabledValues, setDisabledValues] = React.useState("value");

    return (
        <View style={styles.container}>
            <Header title="Dynamic Picker" />
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
                <DynamicPicker
                    label="With 2 values"
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                    ]}
                    value={twoValues}
                    onChange={setTwoValues}
                />
                <Spacer size={16} />
                <DynamicPicker
                    label="Disabled"
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                    ]}
                    value={disabledValues}
                    onChange={setDisabledValues}
                    disabled
                />
                <Spacer size={16} />
                <DynamicPicker
                    label="With less than 4 values"
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                        { label: "Value", value: "value3" },
                    ]}
                    value={threeValues}
                    onChange={setThreeValues}
                />
                <Spacer size={16} />
                <DynamicPicker
                    label="Disabled"
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                        { label: "Value", value: "value3" },
                    ]}
                    value={disabledValues}
                    onChange={setDisabledValues}
                    disabled
                />
                <Spacer size={16} />
                <DynamicPicker
                    label="With more than 4 values"
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                        { label: "Value", value: "value3" },
                        { label: "Value", value: "value4" },
                        { label: "Value", value: "value5" },
                        { label: "Value", value: "value6" },
                    ]}
                    value={fourValues}
                    onChange={setFourValues}
                />
                <Spacer size={16} />
                <DynamicPicker
                    label="Disabled"
                    disabled
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                        { label: "Value", value: "value3" },
                        { label: "Value", value: "value4" },
                        { label: "Value", value: "value5" },
                        { label: "Value", value: "value6" },
                    ]}
                    value={disabledValues}
                    onChange={setDisabledValues}
                />
                <Spacer size={16} />
                <DynamicPicker
                    label="With 7 or more values"
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                        { label: "Value", value: "value3" },
                        { label: "Value", value: "value4" },
                        { label: "Value", value: "value5" },
                        { label: "Value", value: "value6" },
                        { label: "Value", value: "value7" },
                    ]}
                    value={sevenValues}
                    onChange={setSevenValues}
                />
                <Spacer size={16} />
                <DynamicPicker
                    label="Disabled"
                    disabled
                    options={[
                        { label: "Value", value: "value" },
                        { label: "Value", value: "value2" },
                        { label: "Value", value: "value3" },
                        { label: "Value", value: "value4" },
                        { label: "Value", value: "value5" },
                        { label: "Value", value: "value6" },
                        { label: "Value", value: "value7" },
                    ]}
                    value={disabledValues}
                    onChange={setDisabledValues}
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
