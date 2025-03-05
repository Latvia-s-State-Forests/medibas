import * as React from "react";
import { ReactElement } from "react";
import {
    NativeSyntheticEvent,
    Pressable,
    StyleProp,
    StyleSheet,
    TextLayoutEventData,
    View,
    ViewStyle,
} from "react-native";
import { SmallIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type CheckboxProps = {
    state: "checked" | "unchecked" | "indeterminate";
    variant?: "default" | "teal";
    disabled?: boolean;
};

export function Checkbox({ state, variant, disabled = false }: CheckboxProps) {
    return (
        <View
            style={[
                checkboxStyles.checkbox,
                state !== "unchecked" && checkboxStyles.checked,
                state !== "unchecked" && variant === "teal" && checkboxStyles.secondColor,
                disabled && checkboxStyles.disabled,
            ]}
        >
            {state === "checked" && <SmallIcon name="bulletPoint" color="white" />}
            {state === "indeterminate" && <SmallIcon name="minus" color="white" />}
        </View>
    );
}

const checkboxStyles = StyleSheet.create({
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
        justifyContent: "center",
        alignItems: "center",
    },
    checked: {
        borderColor: theme.color.green,
        backgroundColor: theme.color.green,
    },
    secondColor: {
        borderColor: theme.color.teal,
        backgroundColor: theme.color.teal,
    },
    disabled: {
        opacity: 0.5,
    },
});

type CheckboxButtonProps = CheckboxProps & {
    label: string | ReactElement;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};
export function CheckboxButton({ label, state, disabled, variant, style, onPress }: CheckboxButtonProps) {
    const [numberOfLines, setNumOfLines] = React.useState(0);

    const onTextLayout = React.useCallback(
        (e: NativeSyntheticEvent<TextLayoutEventData>) => {
            if (numberOfLines === 0) {
                setNumOfLines(e.nativeEvent.lines.length);
            }
        },
        [numberOfLines]
    );

    return (
        <Pressable
            style={[styles.container, numberOfLines === 1 && styles.centeredContent, style]}
            onPress={onPress}
            disabled={disabled}
        >
            <Checkbox variant={variant} state={state} disabled={disabled} />
            <Text onTextLayout={onTextLayout} style={styles.text} color={disabled ? "gray4" : "gray7"}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 12,
    },
    centeredContent: {
        alignItems: "center",
    },
    text: {
        flex: 1,
        marginLeft: 16,
    },
});
