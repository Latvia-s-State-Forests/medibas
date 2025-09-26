import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { Text } from "~/components/text";
import { Modal } from "../hunt/driven-hunt/modal";

const MAX_LENGTH = 85;

type SaveDrawnShapeModalProps = {
    visible: boolean;
    onConfirm: () => void;
    onChangeText: (text: string) => void;
    onReject: () => void;
    value: string;
};

export function SaveDrawnShapeModal(props: SaveDrawnShapeModalProps) {
    const { t } = useTranslation();

    function onSubmit() {
        props.onConfirm();
    }

    const isSubmitButtonEnabled = props.value;

    return (
        <Modal visible={props.visible} onBackButtonPress={props.onReject}>
            <View>
                <Text style={styles.title} size={18} weight="bold">
                    {t("map.settings.data.addData")}
                </Text>
                <View style={styles.input}>
                    <Input
                        label={t("map.settings.data.addedDataName")}
                        value={props.value}
                        onChangeText={props.onChangeText}
                        maxLength={MAX_LENGTH}
                    />
                </View>
                <View style={styles.buttonsContainer}>
                    <Button title={t("general.add")} onPress={onSubmit} disabled={!isSubmitButtonEnabled} />
                    <Button variant="secondary-outlined" title={t("general.cancel")} onPress={props.onReject} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    title: {
        marginTop: 8,
    },
    input: {
        marginTop: 16,
        gap: 8,
    },
    buttonsContainer: {
        marginTop: 16,
        gap: 8,
    },
});
