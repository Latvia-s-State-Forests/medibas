import { randomUUID } from "expo-crypto";
import { produce } from "immer";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Modal, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Header } from "~/components/header";
import { MediumIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { theme } from "~/theme";
import { OtherBreedModal } from "./other-breed-modal";
import { Stepper } from "./stepper";
import { DogPickerOption } from "./types";

type DogPickerModalProps = {
    visible: boolean;
    options: DogPickerOption[];
    onConfirm: (options: DogPickerOption[]) => void;
    onReject: () => void;
    forceMinCount?: boolean;
};

export function DogPickerModal(props: DogPickerModalProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [isOtherBreedModalVisible, setIsOtherBreedFormVisible] = React.useState(false);
    const [options, setOptions] = React.useState<{ [guid: string]: DogPickerOption }>(() => {
        const options: { [guid: string]: DogPickerOption } = {};
        for (const option of props.options) {
            options[option.guid] = option;
        }
        return options;
    });

    React.useEffect(() => {
        const options: { [guid: string]: DogPickerOption } = {};
        for (const option of props.options) {
            options[option.guid] = option;
        }
        setOptions(options);
    }, [props.options]);

    function onConfirm() {
        props.onConfirm(Object.values(options));
    }

    function onReject() {
        props.onReject();
        // Reset options to initial values
        const options: { [guid: string]: DogPickerOption } = {};
        for (const option of props.options) {
            options[option.guid] = option;
        }
        setOptions(options);
    }

    function onIncrement(option: DogPickerOption) {
        setOptions((options) =>
            produce(options, (options) => {
                options[option.guid].count += 1;
            })
        );
    }

    function onDecrement(option: DogPickerOption) {
        setOptions((options) =>
            produce(options, (options) => {
                options[option.guid].count -= 1;
            })
        );
    }

    function onAddOtherBreed() {
        setIsOtherBreedFormVisible(true);
    }

    function onConfirmOtherBreed(otherBreed: string, count: number) {
        const option: DogPickerOption = {
            guid: randomUUID(),
            breedId: configuration.hunt.otherDogSpeciesId,
            otherBreed,
            count,
            title: t("hunt.dogPickerModal.otherBreed", { otherBreed }),
        };
        setOptions((options) =>
            produce(options, (options) => {
                options[option.guid] = option;
            })
        );
        setIsOtherBreedFormVisible(false);
    }

    function onRejectOtherBreed() {
        setIsOtherBreedFormVisible(false);
    }

    const data = React.useMemo(() => Object.values(options), [options]);

    const countByGuid = React.useMemo(() => {
        const countByGuid = new Map<string, number>();
        for (const option of props.options) {
            countByGuid.set(option.guid, option.count);
        }
        return countByGuid;
    }, [props.options]);

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
                    title={t("hunt.dogPickerModal.title")}
                    showBackButton={false}
                    showCloseButton
                    onCloseButtonPress={onReject}
                    showTopInset={Platform.OS !== "ios"}
                />
                <View style={styles.modalContent}>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.guid}
                        renderItem={({ item }) => {
                            let minCount: number;
                            if (props.forceMinCount) {
                                minCount = countByGuid.get(item.guid) ?? 0;
                            } else {
                                minCount = 0;
                            }
                            return (
                                <View
                                    style={[
                                        styles.listItem,
                                        {
                                            paddingLeft: insets.left + 16,
                                            paddingRight: insets.right + 16,
                                        },
                                    ]}
                                >
                                    <Text style={styles.listItemTitle}>{item.title}</Text>
                                    <Stepper
                                        count={item.count}
                                        onIncrement={() => {
                                            onIncrement(item);
                                        }}
                                        onDecrement={() => {
                                            onDecrement(item);
                                        }}
                                        minCount={minCount}
                                    />
                                </View>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListFooterComponent={
                            <TouchableOpacity
                                onPress={onAddOtherBreed}
                                activeOpacity={0.75}
                                style={[
                                    styles.addButton,
                                    {
                                        paddingLeft: insets.left + 16,
                                        paddingRight: insets.right + 24,
                                    },
                                ]}
                            >
                                <Text weight="bold" color="teal">
                                    {t("hunt.dogPickerModal.add")}
                                </Text>
                                <MediumIcon name="plus" color="teal" />
                            </TouchableOpacity>
                        }
                    />
                </View>
                <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
                    <Button
                        style={styles.button}
                        variant="secondary-outlined"
                        onPress={onReject}
                        title={t("modal.cancel")}
                    />
                    <Button style={styles.button} onPress={onConfirm} title={t("modal.accept")} />
                </View>
            </View>
            <OtherBreedModal
                visible={isOtherBreedModalVisible}
                onConfirm={onConfirmOtherBreed}
                onReject={onRejectOtherBreed}
            />
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
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        backgroundColor: theme.color.white,
    },
    listItemTitle: {
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: theme.color.gray2,
    },
    addButton: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: theme.color.white,
        borderTopWidth: 1,
        borderColor: theme.color.gray2,
        paddingVertical: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        backgroundColor: theme.color.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
        gap: 10,
    },
    button: {
        flex: 1,
    },
});
