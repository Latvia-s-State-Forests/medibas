import * as React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import { IconName, MediumIcon } from "~/components/icon";
import { Color } from "~/theme";

type IconButtonProps = {
    name: IconName<24>;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    color?: Color;
};

export function IconButton({ name, onPress, disabled, style, color }: IconButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.75}
            style={[styles.container, disabled && styles.disabled, style]}
        >
            <MediumIcon name={name} color={color} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
    },
    disabled: {
        opacity: 0.5,
    },
});
