import * as React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { Text } from "~/components/text";
import { Color, theme } from "~/theme";

type ActionButtonProps = {
    title: string;
    onPress: () => void;
    iconName: MediumIconName;
    iconColor?: Color;
    disabled?: boolean;
};

export function ActionButton({ iconName, iconColor = "teal", title, onPress, disabled = false }: ActionButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    function onPressIn() {
        setIsPressed(true);
    }

    function onPressOut() {
        setIsPressed(false);
    }

    return (
        <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={disabled}
            style={[styles.button, isPressed ? styles.pressed : styles.shadow, disabled && styles.disabled]}
        >
            <Text numberOfLines={1} style={styles.text} size={18} weight="bold">
                {title}
            </Text>
            <MediumIcon name={iconName} color={iconColor} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 16,
        paddingVertical: 16.5,
        borderRadius: 8,
        flexDirection: "row",
        backgroundColor: theme.color.white,
        borderWidth: 1,
        borderColor: theme.color.gray2,
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowOpacity: 0.08,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
                shadowColor: theme.color.gray8,
            },
        }),
    },
    pressed: {
        backgroundColor: theme.color.gray2,
    },
    text: {
        flex: 1,
        lineHeight: 24,
    },
    disabled: {
        opacity: 0.5,
    },
});
