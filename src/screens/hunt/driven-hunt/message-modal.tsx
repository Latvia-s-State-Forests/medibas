import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LargestIcon, LargestIconName } from "~/components/icon";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { Modal } from "./modal";

type MessageModalProps = {
    visible: boolean;
    icon: LargestIconName;
    title: string;
    description?: string;
    onBackButtonPress?: () => void;
    buttons: React.ReactNode;
};

export function MessageModal(props: MessageModalProps) {
    return (
        <Modal visible={props.visible} onBackButtonPress={props.onBackButtonPress}>
            <View>
                <View style={styles.messageContainer}>
                    {props.icon === "loading" ? <Spinner /> : <LargestIcon name={props.icon} />}
                    <Text size={18} weight="bold" style={styles.title}>
                        {props.title}
                    </Text>
                    {props.description ? <Text style={styles.description}>{props.description}</Text> : null}
                </View>
                <View style={styles.buttonsContainer}>{props.buttons}</View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        alignItems: "center",
        marginTop: 18,
        paddingHorizontal: 8,
    },
    title: {
        marginTop: 24,
        textAlign: "center",
    },
    description: {
        marginTop: 12,
        textAlign: "center",
    },
    buttonsContainer: {
        marginTop: 24,
        gap: 8,
    },
});
