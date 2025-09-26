import * as React from "react";
import { Pressable, View, StyleProp, StyleSheet, TextInput, TextInputProps, ViewStyle } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type InputProfileProps = TextInputProps & {
    label: string;
    secondaryLabel?: string;
    style?: StyleProp<ViewStyle>;
};

export const InputProfile = React.forwardRef<TextInput, InputProfileProps>(
    (props: InputProfileProps, ref: React.Ref<Partial<TextInput>>) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const inputRef = React.useRef<TextInput>(null);
        const active = isFocused || props.value;
        const labelSize = active ? 12 : 18;
        const labelTextColor = active ? "gray7" : "gray5";
        const labelTextWeight = active ? "bold" : "regular";
        const borderColor = { borderColor: isFocused ? theme.color.greenActive : theme.color.gray2 };
        const isInputActive = active ? styles.textInput : styles.textInputNotActive;
        const labelLineHeight = !active ? { lineHeight: 23 } : { lineHeight: 16 };

        React.useImperativeHandle(ref, () => ({
            focus: () => {
                inputRef?.current?.focus();
            },
        }));

        function onContainerPress() {
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
                    active ? styles.containerWithValue : styles.containerWithoutValue,
                    props.style,
                ]}
                onPress={onContainerPress}
            >
                <View style={styles.textContainer}>
                    <Text size={labelSize} color={labelTextColor} weight={labelTextWeight} style={labelLineHeight}>
                        {props.label}
                    </Text>

                    <TextInput
                        {...props}
                        ref={inputRef}
                        value={props.value}
                        onChangeText={props.onChangeText}
                        style={isInputActive}
                        onFocus={onFocus}
                        onBlur={onBlur}
                    />
                </View>
            </Pressable>
        );
    }
);

InputProfile.displayName = "InputProfile";

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
    },
});
