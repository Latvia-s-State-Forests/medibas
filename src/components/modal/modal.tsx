import { Platform, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import RnModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "~/theme";
import { SmallIcon } from "../icon";

type ModalProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export function Modal({ visible, onClose, children }: ModalProps) {
    const insets = useSafeAreaInsets();
    return (
        <RnModal
            style={styles.container}
            onBackButtonPress={onClose}
            backdropColor={theme.color.green}
            backdropOpacity={0.8}
            isVisible={visible}
            statusBarTranslucent
        >
            <KeyboardAwareScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
                bottomOffset={Platform.select({ ios: 24, android: 48 })}
            >
                <View
                    style={[
                        styles.content,
                        {
                            marginLeft: insets.left + 16,
                            marginRight: insets.right + 16,
                            marginBottom: insets.bottom + 16,
                            marginTop: insets.top + 16,
                        },
                    ]}
                >
                    <Pressable onPress={onClose} style={styles.absolute}>
                        <SmallIcon name="crossBold" />
                    </Pressable>
                    <View>{children}</View>
                </View>
            </KeyboardAwareScrollView>
        </RnModal>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    content: {
        minHeight: 230,
        borderRadius: 8,
        paddingTop: 34,
        paddingHorizontal: 36,
        backgroundColor: theme.color.white,
    },
    absolute: {
        position: "absolute",
        right: 0,
        top: 0,
        padding: 16,
    },
});
