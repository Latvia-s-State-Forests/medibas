import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { MultiSelect } from "~/components/multi-select";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function MultiSelectExampleScreen() {
    const insets = useSafeAreaInsets();
    const noValues: number[] = [];
    const selectedValues = [1, 2, 3];
    const selectedLongListValues = [1, 2, 3, 4, 5, 6, 7];
    const [simpleValues, setSimpleValues] = React.useState<number[]>([]);
    const [complexValues, setComplexValues] = React.useState<Array<{ firstId: number; secondId: number }>>([]);

    function equals(a: number, b: number) {
        return a === b;
    }

    function keyExtractor(value: number) {
        return value.toString();
    }

    function ignore() {
        // ignore
    }

    return (
        <View style={styles.container}>
            <Header title="Multi Select" />
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
                <MultiSelect
                    label="MultiSelect (with value)"
                    options={[
                        { label: "Value1", value: 1 },
                        { label: "Value2", value: 2 },
                        { label: "Value3", value: 3 },
                        { label: "Value4", value: 4 },
                        { label: "Value5", value: 5 },
                        { label: "Value6", value: 6 },
                    ]}
                    values={selectedValues}
                    onChange={ignore}
                    equals={equals}
                    keyExtractor={keyExtractor}
                />
                <Spacer size={16} />
                <MultiSelect
                    disabled
                    label="MultiSelect (disabled, with value)"
                    options={[
                        { label: "Value1", value: 1 },
                        { label: "Value2", value: 2 },
                    ]}
                    values={selectedValues}
                    onChange={ignore}
                    equals={equals}
                    keyExtractor={keyExtractor}
                />
                <Spacer size={16} />
                <MultiSelect
                    label="MultiSelect (with value truncation)"
                    options={[
                        { label: "Value1", value: 1 },
                        { label: "Value2", value: 2 },
                        { label: "Value3", value: 3 },
                        { label: "Value4", value: 4 },
                        { label: "Value5", value: 5 },
                        { label: "Value6", value: 6 },
                    ]}
                    values={selectedLongListValues}
                    onChange={ignore}
                    equals={equals}
                    keyExtractor={keyExtractor}
                />
                <Spacer size={16} />
                <MultiSelect
                    label="MultiSelect (no value)"
                    options={[
                        { label: "Value1", value: 1 },
                        { label: "Value2", value: 2 },
                        { label: "Value3", value: 3 },
                        { label: "Value4", value: 4 },
                        { label: "Value5", value: 5 },
                        { label: "Value6", value: 6 },
                    ]}
                    values={noValues}
                    onChange={ignore}
                    equals={equals}
                    keyExtractor={keyExtractor}
                />
                <Spacer size={16} />
                <MultiSelect
                    disabled
                    label="MultiSelect (disabled, no value)"
                    options={[
                        { label: "Value1", value: 1 },
                        { label: "Value2", value: 2 },
                    ]}
                    values={noValues}
                    onChange={ignore}
                    equals={equals}
                    keyExtractor={keyExtractor}
                />
                <Spacer size={16} />
                <MultiSelect
                    label="MultiSelect (show example of truncating values)"
                    options={[
                        { label: "Value1", value: 1 },
                        { label: "Value2", value: 2 },
                        { label: "Value3", value: 3 },
                        { label: "Value4", value: 4 },
                        { label: "Value5", value: 5 },
                        { label: "Value6", value: 6 },
                    ]}
                    values={noValues}
                    onChange={ignore}
                    equals={equals}
                    keyExtractor={keyExtractor}
                />
                <Spacer size={16} />
                <MultiSelect
                    label="MultiSelect (dynamic, simple)"
                    options={[
                        { label: "First value", value: 1 },
                        { label: "Second value", value: 2 },
                        { label: "Third value", value: 3 },
                        { label: "Fourth value", value: 4 },
                        { label: "Fifth value", value: 5 },
                        { label: "Sixth value", value: 6 },
                        { label: "Seventh value", value: 7 },
                        { label: "Eight value", value: 8 },
                        { label: "Ninth value", value: 9 },
                        { label: "Tenth value", value: 10 },
                        { label: "Eleventh value", value: 11 },
                        { label: "Twelfth value", value: 12 },
                        { label: "Thirteenth value", value: 13 },
                        { label: "Fourteenth value", value: 14 },
                        { label: "Fifteenth value", value: 15 },
                        { label: "Sixteenth value", value: 16 },
                        { label: "Seventeenth value", value: 17 },
                        { label: "Eighteenth value", value: 18 },
                        { label: "Nineteenth value", value: 19 },
                        { label: "Twentieth value", value: 20 },
                    ]}
                    values={simpleValues}
                    onChange={setSimpleValues}
                    equals={equals}
                    keyExtractor={keyExtractor}
                />
                <Spacer size={16} />
                <MultiSelect
                    label="MultiSelect (dynamic, complex)"
                    options={[
                        { label: "First value (1, 10)", value: { firstId: 1, secondId: 10 } },
                        { label: "Second value (2, 9)", value: { firstId: 2, secondId: 9 } },
                        { label: "Third value (3, 8)", value: { firstId: 3, secondId: 8 } },
                        { label: "Fourth value (4, 7)", value: { firstId: 4, secondId: 7 } },
                        { label: "Fifth value (5, 6)", value: { firstId: 5, secondId: 6 } },
                        { label: "Sixth value (6, 5)", value: { firstId: 6, secondId: 5 } },
                        { label: "Seventh value (7, 4)", value: { firstId: 7, secondId: 4 } },
                        { label: "Eight value (8, 3)", value: { firstId: 8, secondId: 3 } },
                        { label: "Ninth value (9, 2)", value: { firstId: 9, secondId: 2 } },
                        { label: "Tenth value (10, 1)", value: { firstId: 10, secondId: 1 } },
                    ]}
                    values={complexValues}
                    onChange={setComplexValues}
                    equals={(a, b) => a.firstId === b.firstId && a.secondId === b.secondId}
                    keyExtractor={(value) => value.firstId + "_" + value.secondId}
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
