import { Platform, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import RnModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "~/theme";

type ModalProps = {
    visible: boolean;
    children: React.ReactNode;
    onBackButtonPress?: () => void;
};

export function Modal(props: ModalProps) {
    const insets = useSafeAreaInsets();
    return (
        <RnModal
            style={styles.container}
            onBackButtonPress={props.onBackButtonPress}
            backdropColor={theme.color.green}
            backdropOpacity={0.8}
            isVisible={props.visible}
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
                    {props.children}
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
        borderRadius: 16,
        padding: 16,
        backgroundColor: theme.color.white,
    },
});
