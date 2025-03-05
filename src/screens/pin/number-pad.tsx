import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { MediumIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type NumberPadProps = {
    onNumberPress: (number: number) => void;
    onBackspacePress: () => void;
};

export function NumberPad({ onNumberPress, onBackspacePress }: NumberPadProps) {
    function numbers() {
        const result = [];
        for (let i = 1; i <= 12; i++) {
            result.push(i);
        }
        return result;
    }

    return (
        <View style={styles.numberPad}>
            {numbers().map((number) => {
                if (number === 10) {
                    return <InvisibleButton key={"invisibleButton"} />;
                }
                if (number === 12) {
                    return <BackspaceButton key={`button${number}`} onPress={onBackspacePress} />;
                } else {
                    return (
                        <NumberPadButton
                            key={`button${number}`}
                            number={number === 11 ? 0 : number}
                            onPress={() => onNumberPress(number === 11 ? 0 : number)}
                        />
                    );
                }
            })}
        </View>
    );
}

type RoundButtonProps = {
    number: number;
    onPress: () => void;
};

function NumberPadButton({ number, onPress }: RoundButtonProps) {
    const [pressed, setPressed] = React.useState(false);
    return (
        <Pressable
            style={[styles.button, pressed && styles.active, !pressed && styles.shadow]}
            onPress={onPress}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
        >
            <Text color={pressed ? "white" : undefined} weight="bold">
                {number}
            </Text>
        </Pressable>
    );
}

type BackspaceButtonProps = {
    onPress: () => void;
};

function BackspaceButton({ onPress }: BackspaceButtonProps) {
    const [pressed, setPressed] = React.useState(false);
    return (
        <Pressable
            onPress={onPress}
            style={[styles.invisibleButton, pressed && styles.active]}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
        >
            <MediumIcon color={pressed ? "white" : undefined} name="backspace" width={32} height={32} />
        </Pressable>
    );
}

function InvisibleButton() {
    return <View style={styles.invisibleButton} />;
}

const styles = StyleSheet.create({
    numberPad: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        width: (64 + 16) * 3, // width of the button + total margin
        alignItems: "center",
        marginBottom: 16,
    },
    button: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
        justifyContent: "center",
        alignItems: "center",
        margin: 8,
    },
    invisibleButton: {
        width: 64,
        height: 64,
        margin: 8,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: theme.color.transparent,
        justifyContent: "center",
        alignItems: "center",
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowOffset: { width: 2, height: 4 },
                shadowColor: theme.color.gray8,
                shadowOpacity: 0.08,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
                shadowColor: theme.color.gray8,
            },
        }),
    },
    active: {
        backgroundColor: theme.color.green,
        borderColor: theme.color.green,
    },
});
