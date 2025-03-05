import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { CheckboxButton } from "~/components/checkbox-button";
import { FieldLabel } from "~/components/field-label";

type Option<T> = {
    label: string;
    value: T;
};

type CheckboxListProps<T extends string | number> = {
    label?: string;
    options: Array<Option<T>>;
    checkedValues: T[];
    onChange: (checkedValues: T[]) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function CheckboxList<T extends string | number>({
    label,
    options,
    checkedValues,
    onChange,
    disabled,
    style,
}: CheckboxListProps<T>) {
    function onCheckboxPress(value: T) {
        if (checkedValues.includes(value)) {
            onChange(checkedValues.filter((checkedValue) => checkedValue !== value));
        } else {
            onChange([...checkedValues, value]);
        }
    }

    return (
        <View style={style}>
            {label && <FieldLabel style={styles.fieldLabel} label={label} />}

            <View>
                {options.map((option) => {
                    const isChecked = checkedValues.includes(option.value);

                    return (
                        <CheckboxButton
                            state={isChecked ? "checked" : "unchecked"}
                            key={option.value.toString()}
                            label={option.label}
                            disabled={disabled}
                            onPress={() => onCheckboxPress(option.value)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fieldLabel: {
        marginBottom: 4,
    },
});
