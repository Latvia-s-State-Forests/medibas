import * as React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { MediumIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type PhotoSelectProps = {
    onPress?: () => void;
};

export function PhotoSelect({ onPress }: PhotoSelectProps) {
    const { t } = useTranslation();
    const [isPressed, setIsPressed] = React.useState(false);

    function handlePressIn() {
        setIsPressed(() => true);
    }

    function handlePressOut() {
        setIsPressed(() => false);
    }

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, isPressed && styles.pressedContainer]}
        >
            <View style={styles.innerContainer}>
                <Spacer horizontal size={16} />
                <View style={styles.icon}>
                    <MediumIcon name="picture" />
                </View>
                <Spacer size={16} />
                <Text size={18} weight="bold">
                    {t("photo.prompt.title")}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        backgroundColor: theme.color.sand,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    innerContainer: {
        alignItems: "center",
    },
    pressedContainer: {
        backgroundColor: theme.color.sandPressed,
    },
    icon: {
        backgroundColor: theme.color.white,
        padding: 12,
        borderRadius: 24,
    },
});
