import * as React from "react";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { Color } from "~/theme";
import { BorderlessBadge } from "./borderless-badge";

type IconButtonProps = {
    name: MediumIconName;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    color?: Color;
    badgeCount?: number;
};

export function IconButton({ name, onPress, disabled, style, color, badgeCount }: IconButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.75}
            style={[styles.container, disabled && styles.disabled, style]}
        >
            <MediumIcon name={name} color={color} />
            <View style={styles.badge}>
                {badgeCount ? <BorderlessBadge variant="action-required" count={badgeCount} /> : null}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        alignItems: "flex-end",
    },
    disabled: {
        opacity: 0.5,
    },
});
