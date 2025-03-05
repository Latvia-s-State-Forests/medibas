import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MediumIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type LogoutButtonProps = {
    title: string;
    onPress?: () => void;
};

export function LogoutButton({ title, onPress }: LogoutButtonProps) {
    const insets = useSafeAreaInsets();
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
            style={[
                styles.container,
                isPressed && styles.pressedContainer,
                {
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                    paddingBottom: insets.bottom,
                },
            ]}
        >
            <View style={styles.innerContainer}>
                <Text style={styles.text} size={18} weight="bold">
                    {title}
                </Text>
                <Spacer horizontal size={16} />
                <MediumIcon name="exit" />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.color.sand,
    },
    innerContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        paddingHorizontal: 16,
    },
    pressedContainer: {
        backgroundColor: theme.color.sandPressed,
    },
    text: {
        flex: 1,
    },
});
