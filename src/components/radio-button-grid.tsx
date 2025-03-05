import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { FieldLabel } from "~/components/field-label";
import { RadioButton } from "~/components/radio-button";

type Option = {
    label: string;
    value: string;
};

type RadioButtonGridProps = {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function RadioButtonGrid({ label, options, onChange, disabled, style, value }: RadioButtonGridProps) {
    const rows: JSX.Element[] = [];

    for (let i = 0; i < options.length; i += 2) {
        const option1 = options[i];
        const option2 = options[i + 1];

        rows.push(
            <View key={i} style={styles.row}>
                <RadioButton
                    disabled={disabled}
                    onPress={() => onChange(option1.value)}
                    label={option1.label}
                    checked={option1.value === value}
                    style={styles.radioButton}
                />

                {option2 ? (
                    <RadioButton
                        disabled={disabled}
                        onPress={() => onChange(option2.value)}
                        label={option2.label}
                        checked={option2.value === value}
                        style={[styles.radioButton, styles.radioButtonMargin]}
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
    radioButton: {
        flex: 1,
    },
    radioButtonMargin: {
        marginLeft: 8,
    },
    emptyOption: {
        flex: 1,
        marginLeft: 8,
    },
    fieldLabel: {
        marginBottom: 4,
    },
});
