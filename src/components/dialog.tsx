import * as React from "react";
import { StyleSheet, View } from "react-native";
import RnModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconName, LargestIcon } from "~/components/icon";
import { theme } from "~/theme";
import { Text } from "./text";

type DialogProps = {
    visible: boolean;
    icon?: "loading" | "success" | "failure" | "lock" | "delete" | "hunt" | React.ReactElement;
    title?: string;
    description?: string;
    buttons?: React.ReactNode;
    onBackButtonPress?: () => void;
};

export function Dialog(props: DialogProps) {
    const insets = useSafeAreaInsets();
    return (
        <RnModal
            style={[
                styles.container,
                {
                    paddingLeft: insets.left + 16,
                    paddingRight: insets.right + 16,
                    paddingBottom: insets.bottom + 16,
                    paddingTop: insets.top + 16,
                },
            ]}
            onBackButtonPress={props.onBackButtonPress}
            backdropColor={theme.color.green}
            backdropOpacity={0.8}
            isVisible={props.visible}
        >
            <View style={styles.modal}>
                {props.icon ? (
                    <View style={styles.iconContainer}>
                        {typeof props.icon === "string" ? (
                            <LargestIcon name={props.icon as IconName<96>} />
                        ) : (
                            props.icon
                        )}
                    </View>
                ) : null}
                {props.title || props.description ? (
                    <View style={styles.textContainer}>
                        {props.title ? (
                            <Text size={22} weight="bold" style={styles.text}>
                                {props.title}
                            </Text>
                        ) : null}
                        {props.description ? <Text style={styles.text}>{props.description}</Text> : null}
                    </View>
                ) : null}
                {props.buttons ? <View style={styles.buttonContainer}>{props.buttons}</View> : null}
            </View>
        </RnModal>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 0,
    },
    modal: {
        width: "100%",
        borderRadius: 8,
        padding: 16,
        backgroundColor: theme.color.white,
        alignItems: "center",
    },
    iconContainer: {
        marginTop: 18,
        marginBottom: 24,
    },
    textContainer: {
        gap: 12,
        marginBottom: 34,
    },
    text: {
        textAlign: "center",
    },
    buttonContainer: {
        gap: 16,
        width: "100%",
    },
});
