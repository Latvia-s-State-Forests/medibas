import { StyleSheet, View } from "react-native";
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
            avoidKeyboard
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
        </RnModal>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 0,
    },
    content: {
        borderRadius: 16,
        padding: 16,
        backgroundColor: theme.color.white,
    },
});
