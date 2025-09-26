import { t } from "i18next";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "~/components/button";
import { LargestIcon } from "~/components/icon";
import { Modal } from "~/components/modal/modal";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type DeleteConfirmationModalProps = {
    variant?: "default" | "danger";
    title: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    visible: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    timed?: boolean;
    disabled?: boolean;
};

export function DeleteConfirmationModal({
    variant = "default",
    title,
    description,
    onConfirm,
    onCancel,
    visible,
    onClose,
    children,
    timed,
    disabled,
}: DeleteConfirmationModalProps) {
    const [timer, setTimer] = React.useState(10);

    React.useEffect(() => {
        if (timed) {
            const interval = setInterval(() => {
                if (timer > 0) {
                    setTimer(timer - 1);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timed, timer]);
    return (
        <Modal visible={visible} onClose={onClose}>
            <View style={styles.center}>
                <LargestIcon name="delete" />
                <Spacer size={38} />
                <Text size={22} weight="bold" style={styles.text}>
                    {title}
                </Text>
                {description ? <Text style={[styles.margin, styles.text]}>{description}</Text> : null}
            </View>

            {children ? <View style={styles.childrenContainer}>{children}</View> : <Spacer size={36} />}

            <View>
                {variant === "danger" && (
                    <Button
                        onPress={onConfirm}
                        variant="danger"
                        title={timed ? (timer === 0 ? t("general.delete") : String(timer)) : t("general.delete")}
                        disabled={(timed && timer > 0) || disabled}
                    />
                )}
                {variant === "default" && <Button onPress={onConfirm} title={t("general.delete")} />}
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
    },
    margin: {
        marginTop: 12,
    },
    childrenContainer: {
        paddingVertical: 24,
    },
});
