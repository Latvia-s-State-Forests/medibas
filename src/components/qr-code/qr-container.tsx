import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Pressable, StyleSheet } from "react-native";
import { theme } from "~/theme";
import { LargeIcon } from "../icon";

type QRContainerProps = {
    value: string;
    title: string;
    description?: string;
    background?: boolean;
};

export function QRContainer({ value, title, description, background = true }: QRContainerProps) {
    const navigation = useNavigation();
    const [isPressed, setIsPressed] = React.useState(false);

    function onPress() {
        navigation.navigate("QRPreviewModal", { value, title, description });
    }

    function onPressIn() {
        setIsPressed(true);
    }

    function onPressOut() {
        setIsPressed(false);
    }

    return (
        <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={[styles.container, background && styles.background, isPressed && styles.pressed]}
        >
            <LargeIcon name="qrcode" />
        </Pressable>
    );
}
const styles = StyleSheet.create({
    container: {
        height: 48,
        width: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    background: {
        backgroundColor: theme.color.white,
    },
    pressed: {
        opacity: 0.5,
    },
});
