import * as React from "react";
import { Platform, Pressable, StyleSheet, StyleProp, ViewStyle, View } from "react-native";
import { Badge } from "~/components/badge";
import { LargeIcon, IconName } from "~/components/icon";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type CardButtonProps = {
    iconName: IconName<32>;
    onPress: () => void;
    disabled?: boolean;
    radius?: "small" | "medium";
    label: string;
    active: boolean;
    badgeCount?: number;
    style?: StyleProp<ViewStyle>;
};

export function CardButton({
    iconName,
    onPress,
    disabled,
    label,
    active,
    radius = "medium",
    badgeCount,
    style,
}: CardButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);
    const buttonStyle = active
        ? isPressed
            ? styles.activePressed
            : styles.active
        : isPressed
        ? styles.lightGray
        : styles.shadow;
    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            style={[
                radius === "small" ? styles.radiusSmall : styles.radiusMedium,
                styles.button,
                disabled && styles.disabled,
                buttonStyle,
                style,
            ]}
            disabled={disabled}
        >
            <View style={styles.badge}>
                {badgeCount && badgeCount > 0 ? <Badge variant="action-required" count={badgeCount} /> : null}
            </View>
            <LargeIcon name={iconName} color={active ? "white" : "gray8"} />
            <Text style={styles.text} size={12} color={active ? "white" : "gray8"}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    badge: {
        position: "absolute",
        top: 8,
        right: 8,
    },
    text: {
        textAlign: "center",
    },
    shadow: {
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.08,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    lightGray: {
        backgroundColor: theme.color.gray2,
        borderColor: theme.color.gray2,
    },
    active: {
        backgroundColor: theme.color.greenActive,
        borderColor: theme.color.greenActive,
    },
    activePressed: {
        backgroundColor: theme.color.greenPressed,
        borderColor: theme.color.greenPressed,
    },
    radiusSmall: {
        borderRadius: 4,
    },
    radiusMedium: {
        borderRadius: 8,
    },
    disabled: {
        opacity: 0.5,
    },
});
