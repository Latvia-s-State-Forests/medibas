import * as React from "react";
import { Pressable, View, StyleProp, StyleSheet, TextInput, TextInputProps, ViewStyle, Platform } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type InputProps = TextInputProps & {
    label: string;
    secondaryLabel?: string;
    style?: StyleProp<ViewStyle>;
    isMultiline?: boolean;
};

export function Input({
    label,
    value,
    onChangeText,
    editable = true,
    isMultiline = false,
    style,
    keyboardType = "default",
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<TextInput>(null);
    const active = isFocused || value;
    const labelSize = active ? 12 : 18;
    const labelTextColor = active ? "gray7" : "gray5";
    const labelTextWeight = active ? "bold" : "regular";
    const opacity = { opacity: editable ? 1 : 0.5 };
    const borderColor = { borderColor: isFocused ? theme.color.greenActive : theme.color.gray2 };
    const isInputActive = active ? styles.textInput : styles.textInputNotActive;
    const labelLineHeight = !active ? { lineHeight: 23 } : { lineHeight: 16 };
    const inputHeight = isMultiline ? { lineHeight: 24, paddingTop: 0 } : { paddingTop: Platform.OS === "ios" ? 3 : 0 };

    function onContainerPress() {
        if (!editable) {
            return;
        }
        inputRef.current?.focus();
    }

    function onFocus() {
        setIsFocused(true);
    }

    function onBlur() {
        setIsFocused(false);
    }

    return (
        <Pressable
            style={[
                styles.container,
                borderColor,
                opacity,
                active ? styles.containerWithValue : styles.containerWithoutValue,
                style,
            ]}
            onPress={onContainerPress}
        >
            <View style={styles.textContainer}>
                <Text
                    numberOfLines={1}
                    size={labelSize}
                    color={labelTextColor}
                    weight={labelTextWeight}
                    style={labelLineHeight}
                >
                    {label}
                </Text>

                <TextInput
                    {...props}
                    scrollEnabled={false}
                    numberOfLines={isMultiline ? 0 : 1}
                    multiline={isMultiline}
                    ref={inputRef}
                    value={value}
                    onChangeText={onChangeText}
                    editable={true}
                    style={[isInputActive, inputHeight]}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    keyboardType={keyboardType}
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        backgroundColor: theme.color.white,
        flexDirection: "row",
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 56,
    },
    containerWithValue: {
        paddingVertical: 7,
    },
    containerWithoutValue: {
        paddingTop: 15,
        paddingBottom: 15.6,
    },
    textContainer: {
        flex: 1,
    },
    textInput: {
        fontSize: 16,
        color: theme.color.gray8,
        position: "relative",
    },
    textInputNotActive: {
        position: "absolute",
        top: -20,
    },
});
