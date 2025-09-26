import * as React from "react";
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from "react-native";
import { FieldLabel } from "~/components/field-label";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type Option = {
    label?: string;
    value: string;
    disabled?: boolean;
};

type SegmentedControlProps = {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function SegmentedControl({ label, options, value, onChange, disabled, style }: SegmentedControlProps) {
    return (
        <View style={style}>
            {label && <FieldLabel style={styles.fieldLabel} label={label} />}
            <View style={styles.container}>
                {options.map((option, index) => (
                    <SegmentedControlOption
                        index={index}
                        checked={option.value === value}
                        key={option.value}
                        label={option.label}
                        disabled={disabled || option.disabled}
                        onPress={() => onChange(option.value)}
                    />
                ))}
            </View>
        </View>
    );
}

type SegmentedControlOptionProps = {
    checked: boolean;
    disabled?: boolean;
    label?: string;
    onPress: () => void;
    index: number;
};

function SegmentedControlOption({ label, checked, disabled, onPress, index }: SegmentedControlOptionProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.option,
                checked && styles.checked,
                disabled && styles.disabled,
                index !== 0 && styles.leftMargin,
            ]}
            disabled={disabled}
        >
            <Text weight="bold" style={[styles.text, checked && styles.checkedText]}>
                {label}
            </Text>
        </Pressable>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 4,
        borderRadius: 8,
        flexDirection: "row",
        backgroundColor: theme.color.sandPressed,
    },
    checked: {
        borderRadius: 6,
        backgroundColor: theme.color.green,
    },
    option: {
        flex: 1,
        paddingHorizontal: 4,
        paddingVertical: 14,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 12,
        textAlign: "center",
        color: theme.color.gray7,
    },
    checkedText: {
        color: theme.color.white,
    },
    fieldLabel: {
        marginBottom: 16,
    },
    disabled: {
        opacity: 0.5,
    },
    leftMargin: {
        marginLeft: 4,
    },
});
