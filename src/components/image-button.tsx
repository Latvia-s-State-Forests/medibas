import * as React from "react";
import { StyleSheet, Image, Pressable } from "react-native";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type ImageButtonProps = {
    imageName: ReturnType<typeof require>;
    label: string;
    onPress: () => void;
    checked: boolean;
};

export function ImageButton({ imageName, checked, label, onPress }: ImageButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    function handlePressIn() {
        setIsPressed(() => true);
    }

    function handlePressOut() {
        setIsPressed(() => false);
    }

    return (
        <Pressable
            style={[isPressed && styles.isPressed, styles.container]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Image style={[styles.image, checked && styles.checked]} source={imageName} />
            <Spacer size={5} />
            <Text size={12} style={styles.text}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    image: {
        width: 72,
        height: 72,
        borderRadius: 8,
        borderColor: theme.color.gray2,
        borderWidth: 4,
    },
    isPressed: {
        opacity: 0.75,
    },
    checked: {
        borderColor: theme.color.greenActive,
    },
    text: {
        textAlign: "center",
        width: 80,
    },
});
