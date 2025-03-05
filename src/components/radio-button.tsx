import * as React from "react";
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type RadioProps = {
    checked: boolean;
};

export function Radio({ checked }: RadioProps) {
    return <View style={[radioStyles.radio, checked && radioStyles.checked]} />;
}

const radioStyles = StyleSheet.create({
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    checked: {
        borderColor: theme.color.green,
        backgroundColor: theme.color.white,
        borderWidth: 6,
        justifyContent: "center",
        alignItems: "center",
    },
});

type RadioButtonProps = {
    label: string;
    checked: boolean;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function RadioButton({ label, checked, disabled, style, onPress }: RadioButtonProps) {
    return (
        <Pressable style={[styles.container, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled}>
            <Radio checked={checked} />
            <Text style={styles.text}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 12,
    },
    text: {
        flex: 1,
        marginLeft: 16,
        color: theme.color.gray7,
    },
    disabled: {
        opacity: 0.5,
    },
});
