import { t } from "i18next";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "~/components/button";
import { LargestIcon } from "~/components/icon";
import { Modal } from "~/components/modal/modal";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type ConcludeConfirmationModalProps = {
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    onClose: () => void;
    visible: boolean;
};

export function ConcludeConfirmationModal({
    title,
    onConfirm,
    onCancel,
    onClose,
    visible,
}: ConcludeConfirmationModalProps) {
    return (
        <Modal visible={visible} onClose={onClose}>
            <View style={styles.center}>
                <LargestIcon name="lock" color="gray4" />
                <Spacer size={38} />
                <Text size={22} weight="bold" style={styles.text}>
                    {title}
                </Text>
            </View>
            <Spacer size={36} />
            <View>
                <Button onPress={onConfirm} title={t("modal.conclude")} />
                <Spacer size={16} />
                <Button onPress={onCancel} variant="secondary-light" title={t("modal.cancel")} />
                <Spacer size={18} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: "center",
        alignItems: "center",
    },

    text: {
        textAlign: "center",
        lineHeight: 28,
    },
});
