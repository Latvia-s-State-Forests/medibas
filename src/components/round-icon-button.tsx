import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { SmallIconName, SmallIcon } from "~/components/icon";
import { theme } from "~/theme";

type RoundIconButtonProps = {
    name: SmallIconName;
    elevation?: "low" | "high";
    onPress: () => void;
    appearance?: "default" | "active" | "background";
    disabled?: boolean;
};

export function RoundIconButton({
    name,
    appearance = "default",
    onPress,
    disabled,
    elevation = "low",
}: RoundIconButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    function handlePressIn() {
        setIsPressed(true);
    }

    function handlePressOut() {
        setIsPressed(false);
    }

    const defaultState = !disabled && !isPressed;
    const elevationIsLow = elevation === "low" && defaultState && styles.lowShadow;
    const elevationIsHigh = elevation === "high" && defaultState && styles.highShadow;

    return (
        <Pressable
            style={styles.container}
            onPress={onPress}
            disabled={disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <View
                style={[
                    styles.button,
                    elevationIsLow || elevationIsHigh,
                    appearance === "active" && styles.activeAppearance,
                    disabled && styles.disabled,
                    isPressed && styles.buttonPressed,
                ]}
            >
                {appearance === "default" ? <SmallIcon name={name} color={isPressed ? "white" : "gray8"} /> : null}
                {appearance === "background" ? <SmallIcon name={name} color={isPressed ? "white" : "orange"} /> : null}
                {appearance === "active" ? <SmallIcon name={name} color={isPressed ? "white" : "white"} /> : null}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 4,
    },
    button: {
        height: 40,
        width: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
        shadowColor: theme.color.gray8,
        padding: 16,
    },
    lowShadow: {
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
    highShadow: {
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
    activeAppearance: {
        borderColor: theme.color.teal,
        backgroundColor: theme.color.teal,
    },
    buttonPressed: {
        backgroundColor: theme.color.greenActive,
        borderColor: theme.color.greenActive,
    },
    disabled: {
        opacity: 0.5,
    },
});
