import * as React from "react";
import { Pressable, StyleSheet } from "react-native";
import { SmallIcon } from "~/components/icon";
import { theme } from "~/theme";

type StepperButtonProps = {
    icon: "plus" | "minus";
    onPress: () => void;
    disabled?: boolean;
};

export function StepperButton(props: StepperButtonProps) {
    const [pressed, setPressed] = React.useState(false);
    return (
        <Pressable
            style={[styles.container, props.disabled ? styles.disabled : pressed ? styles.pressed : undefined]}
            onPress={props.onPress}
            onPressIn={() => {
                setPressed(true);
            }}
            onPressOut={() => {
                setPressed(false);
            }}
            disabled={props.disabled}
        >
            <SmallIcon name={props.icon} color={pressed ? "white" : "gray8"} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 14,
        backgroundColor: theme.color.white,
    },
    pressed: {
        backgroundColor: theme.color.greenActive,
    },
    disabled: {
        backgroundColor: theme.color.gray1,
    },
});
