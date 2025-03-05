import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { Button } from "./button";
import { Checkbox } from "./checkbox-button";
import { Header } from "./header";

export type MultiSelectOption<T> = {
    label: string;
    value: T;
};

type MultiSelectModalProps<T> = {
    visible: boolean;
    title: string;
    values: T[];
    options: Array<MultiSelectOption<T>>;
    onConfirm: (value: T[]) => void;
    onReject: () => void;
    equals: (a: T, b: T) => boolean;
    keyExtractor: (value: T) => string;
};

export function MultiSelectModal<T>(props: MultiSelectModalProps<T>) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [values, setValues] = React.useState<T[]>([]);

    React.useEffect(() => {
        setValues(props.values);
    }, [props.values]);

    function onToggleValue(value: T) {
        setValues((values) => {
            const selected = values.some((valueToCheck) => props.equals(valueToCheck, value));
            if (selected) {
                return values.filter((valueToCheck) => !props.equals(valueToCheck, value));
            }
            return values.concat(value);
        });
    }

    function onConfirm() {
        props.onConfirm(values);
    }

    function onReject() {
        props.onReject();
        setValues(props.values);
    }

    return (
        <Modal
            statusBarTranslucent
            visible={props.visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onReject}
        >
            <View style={styles.modal}>
                <Header
                    title={props.title}
                    showBackButton={false}
                    showCloseButton
                    onCloseButtonPress={onReject}
                    showTopInset={Platform.OS !== "ios"}
                />

                <View style={styles.modalContent}>
                    {props.options.length > 0 ? (
                        <FlatList
                            data={props.options}
                            keyExtractor={(option) => props.keyExtractor(option.value)}
                            renderItem={({ item }) => {
                                return (
                                    <ListItem
                                        checked={values.some((value) => props.equals(value, item.value))}
                                        label={item.label}
                                        onPress={() => onToggleValue(item.value)}
                                    />
                                );
                            }}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    ) : (
                        <>
                            <Text style={styles.emptyListMessage}>{t("general.emptyList")}</Text>
                        </>
                    )}
                </View>

                <View
                    style={[
                        styles.buttonContainer,
                        {
                            paddingBottom: insets.bottom + 16,
                            paddingLeft: insets.left + 16,
                            paddingRight: insets.right + 16,
                        },
                    ]}
                >
                    <Button
                        style={styles.button}
                        variant="secondary-outlined"
                        onPress={onReject}
                        title={t("modal.cancel")}
                    />
                    <Button style={styles.button} onPress={onConfirm} title={t("modal.accept")} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    modalContent: {
        flex: 1,
    },
    emptyListMessage: {
        textAlign: "center",
        marginVertical: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        backgroundColor: theme.color.white,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
        gap: 10,
    },
    button: {
        flex: 1,
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
                <Checkbox state={props.checked ? "checked" : "unchecked"} />
                <Text style={styles.listItemLabel}>{props.label}</Text>
            </View>
        </Pressable>
    );
}
