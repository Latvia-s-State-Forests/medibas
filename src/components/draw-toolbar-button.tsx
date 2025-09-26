import * as React from "react";
import { Pressable, StyleSheet } from "react-native";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { theme } from "~/theme";

type DrawToolbarButtonProps = {
    name: MediumIconName;
    onPress: () => void;
    disabled?: boolean;
    selected?: boolean;
};

export function DrawToolbarButton({ name, onPress, disabled, selected }: DrawToolbarButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    function onPressIn() {
        setIsPressed(true);
    }

    function onPressOut() {
        setIsPressed(false);
    }

    let iconColor: "gray8" | "white" | "teal" = "gray8";
    if (isPressed) {
        iconColor = "white";
    } else if (selected) {
        iconColor = "teal";
    }

    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, disabled && styles.disabled, isPressed && styles.buttonPressed]}
            disabled={disabled}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
        >
            <MediumIcon name={name} color={iconColor} />
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
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    buttonPressed: {
        backgroundColor: theme.color.greenActive,
        borderColor: theme.color.greenActive,
    },
    disabled: {
        opacity: 0.5,
    },
});
