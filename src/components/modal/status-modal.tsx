import * as React from "react";
import { View, StyleSheet } from "react-native";
import { LargestIcon } from "~/components/icon";
import { Modal } from "~/components/modal/modal";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

type StatusModalProps = Omit<ModalProps, "children"> & {
    status: "success" | "failure";
    title: string;
    description?: string;
};
export function StatusModal({ status, title, description, ...modalProps }: StatusModalProps) {
    return (
        <Modal {...modalProps}>
            <View style={styles.center}>
                {status === "success" && <LargestIcon style={styles.icon} name="success" />}
                {status === "failure" && <LargestIcon style={styles.icon} name="failure" />}
                <Text size={22} weight="bold" style={styles.text}>
                    {title}
                </Text>
                {description ? <Text style={[styles.margin, styles.text]}>{description}</Text> : null}
                <Spacer size={34} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    icon: {
        marginBottom: 38,
    },
    text: {
        textAlign: "center",
    },
    margin: {
        marginTop: 12,
    },
});
