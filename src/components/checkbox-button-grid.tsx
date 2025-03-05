import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { CheckboxButton } from "~/components/checkbox-button";
import { FieldLabel } from "~/components/field-label";

type Option = {
    label: string;
    value: string;
};

type CheckboxButtonGridProps = {
    label: string;
    options: Option[];
    checkedValues: string[];
    onChange: (checkedValues: string[]) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function CheckboxButtonGrid({
    label,
    options,
    onChange,
    checkedValues,
    disabled,
    style,
}: CheckboxButtonGridProps) {
    function onCheckboxPress(value: string) {
        if (checkedValues.includes(value)) {
            onChange(checkedValues.filter((checkedValue) => checkedValue !== value));
        } else {
            onChange(checkedValues.concat(value));
        }
    }
    const rows: JSX.Element[] = [];
    for (let i = 0; i < options.length; i += 2) {
        const option1 = options[i];
        const option2 = options[i + 1];

        rows.push(
            <View key={i} style={styles.row}>
                <CheckboxButton
                    state={checkedValues.includes(option1.value) ? "checked" : "unchecked"}
                    label={option1.label}
                    disabled={disabled}
                    onPress={() => onCheckboxPress(option1.value)}
                    style={styles.checkbox}
                />

                {option2 ? (
                    <CheckboxButton
                        state={checkedValues.includes(option2.value) ? "checked" : "unchecked"}
                        label={option2.label}
                        disabled={disabled}
                        onPress={() => onCheckboxPress(option2.value)}
                        style={[styles.checkbox, styles.checkboxMargin]}
                    />
                ) : (
                    <View style={styles.emptyOption} />
                )}
            </View>
        );
    }

    return (
        <View style={style}>
            <FieldLabel style={styles.fieldLabel} label={label} />
            <View>{rows}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
    },
    checkbox: {
        flex: 1,
    },
    checkboxMargin: {
        marginLeft: 8,
    },
    emptyOption: {
        flex: 1,
        marginLeft: 8,
    },
    fieldLabel: {
        marginBottom: 8,
    },
});
