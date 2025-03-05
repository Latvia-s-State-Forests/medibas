import * as React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { SmallIcon } from "./icon";
import { MultiSelectModal, MultiSelectOption } from "./multi-select-modal";

type MultiSelectProps<T> = {
    label: string;
    values: T[];
    onChange: (values: T[]) => void;
    options: Array<MultiSelectOption<T>>;
    equals: (a: T, b: T) => boolean;
    keyExtractor: (value: T) => string;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function MultiSelect<T>(props: MultiSelectProps<T>) {
    const [modalVisible, setModalVisible] = React.useState(false);

    function onOpenModal() {
        setModalVisible(true);
    }

    function onConfirm(values: T[]) {
        props.onChange(values);
        setModalVisible(false);
    }

    function onReject() {
        setModalVisible(false);
    }

    const hasValue = props.values.length > 0;
    const labelSize = hasValue ? 12 : 18;
    const lineHeight = !hasValue ? { lineHeight: 23 } : { lineHeight: 16 };
    const labelTextColor = hasValue ? "gray7" : "gray5";
    const labelTextWeight = hasValue ? "bold" : "regular";

    return (
        <>
            <Pressable
                disabled={props.disabled}
                style={[
                    styles.container,
                    hasValue && styles.paddingWithValue,
                    props.disabled && styles.disabled,
                    props.style,
                ]}
                onPress={onOpenModal}
            >
                <View style={styles.textWrapper}>
                    <Text
                        style={lineHeight}
                        numberOfLines={1}
                        color={labelTextColor}
                        weight={labelTextWeight}
                        size={labelSize}
                    >
                        {props.label}
                    </Text>
                    {hasValue ? (
                        <Text numberOfLines={1} style={styles.selectedOptionText} color="gray7">
                            {props.options
                                .filter((option) => props.values.some((value) => props.equals(value, option.value)))
                                .map((option) => option.label)
                                .join(", ")}
                        </Text>
                    ) : null}
                </View>
                <SmallIcon name="chevronDown" color="teal" />
            </Pressable>

            <MultiSelectModal
                visible={modalVisible}
                title={props.label}
                options={props.options}
                values={props.values}
                onConfirm={onConfirm}
                onReject={onReject}
                equals={props.equals}
                keyExtractor={props.keyExtractor}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.color.white,
        flexDirection: "row",
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.color.gray2,
        alignItems: "center",
        minHeight: 56,
    },
    textWrapper: {
        flex: 1,
    },
    paddingWithValue: {
        paddingVertical: 7,
    },
    selectedOptionText: {
        lineHeight: 24,
    },
    disabled: {
        opacity: 0.5,
    },
});
