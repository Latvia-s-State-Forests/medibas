import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { FieldLabel } from "~/components/field-label";
import { RadioButton } from "~/components/radio-button";

type Option = {
    label: string;
    value: string;
};

type RadioButtonListProps = {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function RadioButtonList({ label, options, onChange, disabled, style, value }: RadioButtonListProps) {
    return (
        <View style={style}>
            <FieldLabel style={styles.fieldLabel} label={label} />
            <View>
                {options.map((option) => (
                    <RadioButton
                        checked={option.value === value}
                        key={option.value}
                        label={option.label}
                        disabled={disabled}
                        onPress={() => onChange(option.value)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fieldLabel: {
        marginBottom: 8,
    },
});
