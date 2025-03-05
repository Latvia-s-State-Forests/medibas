import * as React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { theme } from "~/theme";

type SquareIconButtonProps = {
    name: MediumIconName;
    onPress: () => void;
    disabled?: boolean;
};

export function SquareIconButton({ name, onPress, disabled }: SquareIconButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    function handlePressIn() {
        setIsPressed(true);
    }

    function handlePressOut() {
        setIsPressed(false);
    }

    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, disabled && styles.disabled, isPressed && styles.buttonPressed]}
            disabled={disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <MediumIcon name={name} color={isPressed ? "white" : "gray8"} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        width: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.16,
            },
            android: {
                elevation: 7,
            },
        }),
    },
    buttonPressed: {
        backgroundColor: theme.color.greenActive,
        borderColor: theme.color.greenActive,
    },
    disabled: {
        opacity: 0.5,
    },
});
