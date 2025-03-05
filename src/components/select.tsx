import { t } from "i18next";
import * as React from "react";
import { FlatList, Modal, Platform, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { SmallIcon } from "~/components/icon";
import { Radio } from "~/components/radio-button";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type Option<T> = {
    label: string;
    value: T;
};

type SelectProps<T extends string | number> = {
    label: string;
    options: Array<Option<T>>;
    value: T | null | undefined;
    clearable?: boolean;
    onChange: (value: T) => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    readonly?: boolean;
};

export function Select<T extends string | number>({
    label,
    options,
    value,
    onChange,
    disabled = false,
    readonly = false,
    clearable,
    style,
}: SelectProps<T>) {
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = React.useState(false);

    function handleModalClose() {
        setModalVisible(false);
    }

    function handleModalOpen() {
        setModalVisible(true);
    }

    function handleValueChange(value: T) {
        onChange(value);
        handleModalClose();
    }

    const labelSize = value ? 12 : 18;
    const lineHeight = !value ? { lineHeight: 23 } : { lineHeight: 16 };
    const labelTextColor = value ? "gray7" : "gray5";
    const labelTextWeight = value ? "bold" : "regular";
    const selectedOption = options.find((option) => option.value === value);
    const optionsClearable = clearable ? [{ label: t("select.selectOption"), value: "" as T }, ...options] : options;

    return (
        <>
            <Modal
                statusBarTranslucent
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleModalClose}
            >
                <View style={styles.containerModal}>
                    <Header
                        title={label}
                        showBackButton={false}
                        showCloseButton
                        onCloseButtonPress={handleModalClose}
                        showTopInset={Platform.OS !== "ios"}
                    />
                    {optionsClearable.length > 0 ? (
                        <FlatList
                            data={optionsClearable}
                            keyExtractor={(item) => item.value.toString()}
                            renderItem={({ item }) => {
                                return (
                                    <ListItem
                                        checked={item.value === value}
                                        label={item.label}
                                        onPress={() => handleValueChange(item.value)}
                                    />
                                );
                            }}
                            ListFooterComponent={() => <View style={{ height: insets.bottom + 24 }} />}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    ) : (
                        <>
                            <Text style={styles.emptyListMessage}>{t("general.emptyList")}</Text>
                        </>
                    )}
                </View>
            </Modal>
            <Pressable
                disabled={readonly || disabled}
                style={[
                    styles.container,
                    selectedOption ? styles.paddingWithValue : styles.paddingWithoutValue,
                    disabled && styles.disabled,
                    style,
                ]}
                onPress={handleModalOpen}
            >
                <View style={styles.textWrapper}>
                    <Text
                        style={lineHeight}
                        numberOfLines={1}
                        color={labelTextColor}
                        weight={labelTextWeight}
                        size={labelSize}
                    >
                        {label}
                    </Text>
                    {selectedOption && (
                        <Text style={styles.selectedOptionText} color="gray7">
                            {selectedOption.label}
                        </Text>
                    )}
                </View>
                {!readonly ? <SmallIcon name="chevronDown" color="teal" /> : null}
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    containerModal: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
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
    emptyListMessage: {
        textAlign: "center",
        marginVertical: 16,
    },
    textWrapper: {
        flex: 1,
    },
    paddingWithValue: {
        paddingVertical: 7,
    },
    paddingWithoutValue: {
        paddingTop: 15,
        paddingBottom: 15.6,
    },
    selectedOptionText: {
        lineHeight: 24,
    },
    disabled: {
        opacity: 0.5,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 16,
        backgroundColor: theme.color.white,
    },
    listItemPressed: {
        backgroundColor: theme.color.gray1,
    },
    listItemLabel: {
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: theme.color.gray2,
    },
});

type ListItemProps = {
    checked: boolean;
    label: string;
    onPress: () => void;
};

function ListItem(props: ListItemProps) {
    const insets = useSafeAreaInsets();
    const [isPressed, setIsPressed] = React.useState(false);

    function onPressIn() {
        setIsPressed(true);
    }

    function onPressOut() {
        setIsPressed(false);
    }

    return (
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={props.onPress}>
            <View
                style={[
                    styles.listItem,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                    },
                    isPressed ? styles.listItemPressed : undefined,
                ]}
            >
                <Radio checked={props.checked} />
                <Text style={styles.listItemLabel}>{props.label}</Text>
            </View>
        </Pressable>
    );
}
