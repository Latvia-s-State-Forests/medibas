import * as React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { FieldLabel } from "~/components/field-label";
import { RoundIconButton } from "~/components/round-icon-button";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type StepperProps = {
    label: string;
    value: number;
    onChange: (value: number) => void;
    minValue?: number;
    maxValue?: number;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function Stepper({ label, value, onChange, minValue = 0, maxValue = 100, disabled, style }: StepperProps) {
    function handleIncrement() {
        if (value < maxValue) {
            onChange(value + 1);
        }
    }

    function handleDecrement() {
        if (value > minValue) {
            onChange(value - 1);
        }
    }

    return (
        <View style={style}>
            {label && <FieldLabel label={label} />}
            <View style={stepperStyle.controls}>
                <RoundIconButton name="minus" onPress={handleDecrement} disabled={disabled || value <= minValue} />
                <View style={[stepperStyle.valueContainer, disabled && stepperStyle.disabled]}>
                    <Text style={stepperStyle.valueText}>{value}</Text>
                </View>
                <RoundIconButton name="plus" onPress={handleIncrement} disabled={disabled || value >= maxValue} />
            </View>
        </View>
    );
}

const stepperStyle = StyleSheet.create({
    controls: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    valueContainer: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    valueText: {
        textAlign: "center",
        fontSize: 20,
    },
    disabled: {
        opacity: 0.5,
    },
});
