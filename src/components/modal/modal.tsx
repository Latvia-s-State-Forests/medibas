import * as React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import RnModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SmallIcon } from "~/components/icon";
import { theme } from "~/theme";

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export function Modal({ visible, onClose, children }: ModalProps) {
    const insets = useSafeAreaInsets();
    return (
        <RnModal
            style={[
                styles.modalMargin,
                {
                    paddingLeft: insets.left + 16,
                    paddingRight: insets.right + 16,
                    paddingBottom: insets.bottom + 24,
                    paddingTop: insets.top + 16,
                },
            ]}
            swipeDirection={["up", "down"]}
            onSwipeComplete={onClose}
            onBackButtonPress={onClose}
            backdropColor={theme.color.green}
            backdropOpacity={0.8}
            isVisible={visible}
        >
            <View style={styles.modal}>
                <Pressable onPress={onClose} style={styles.absolute}>
                    <SmallIcon name="crossBold" />
                </Pressable>
                <View>{children}</View>
            </View>
        </RnModal>
    );
}

const styles = StyleSheet.create({
    modal: {
        width: "100%",
        minHeight: 230,
        borderRadius: 8,
        paddingTop: 34,
        paddingHorizontal: 36,
        backgroundColor: theme.color.white,
    },
    modalMargin: {
        margin: 0,
    },
    absolute: {
        position: "absolute",
        right: 0,
        top: 0,
        padding: 16,
    },
});
