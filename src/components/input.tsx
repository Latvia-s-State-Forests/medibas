import * as React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type InputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    editable?: boolean;
    keyboardType?: TextInputProps["keyboardType"];
    maxLength?: number;
    ref?: React.Ref<TextInput>;
};

export function Input({
    label,
    value,
    onChangeText,
    editable = true,
    keyboardType = "default",
    maxLength,
    ref,
}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false);
    const showSmallLabel = value || isFocused;

    function onFocus() {
        setIsFocused(true);
    }

    function onBlur() {
        setIsFocused(false);
    }

    return (
        <View
            style={[styles.container, isFocused ? styles.focused : undefined, !editable ? styles.disabled : undefined]}
        >
            <View style={showSmallLabel ? styles.smallLabelContainer : styles.largeLabelContainer}>
                <Text style={showSmallLabel ? styles.smallLabel : styles.largeLabel} numberOfLines={1}>
                    {label}
                </Text>
            </View>

            <TextInput
                ref={ref}
                scrollEnabled={false}
                numberOfLines={1}
                value={value}
                onChangeText={onChangeText}
                editable={editable}
                style={styles.textInput}
                onFocus={onFocus}
                onBlur={onBlur}
                keyboardType={keyboardType}
                maxLength={maxLength}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        backgroundColor: theme.color.white,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        borderRadius: 8,
        minHeight: 56,
    },
    focused: {
        borderColor: theme.color.greenActive,
    },
    disabled: {
        opacity: 0.5,
    },
    smallLabelContainer: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
    },
    smallLabel: {
        fontSize: theme.fontSize[12],
        lineHeight: 16,
        fontFamily: theme.fontFamily.bold,
        color: theme.color.gray7,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    largeLabelContainer: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: "center",
    },
    largeLabel: {
        fontSize: theme.fontSize[18],
        lineHeight: 24,
        color: theme.color.gray5,
        paddingHorizontal: 16,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
        lineHeight: 24,
        fontSize: theme.fontSize[16],
        color: theme.color.gray8,
        verticalAlign: "bottom",
        textAlignVertical: "bottom",
    },
});
