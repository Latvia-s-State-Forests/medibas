import * as React from "react";
import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type SwitchProps = {
    label: string;
    checked: boolean;
    onPress: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function Switch({ label, checked, disabled, style, onPress }: SwitchProps) {
    const translationX = useDerivedValue(() => {
        return withTiming(checked ? 16 : 0, { duration: 200 });
    }, [checked]);

    const backgroundColor = useDerivedValue(() => {
        return withTiming(interpolateColor(checked ? 1 : 0, [0, 1], [theme.color.gray6, theme.color.green]), {
            duration: 200,
        });
    }, [checked]);

    const backgroundColorStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: backgroundColor.value,
        };
    });

    const ellipseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translationX.value }],
        };
    });

    return (
        <Pressable style={[styles.container, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled}>
            <Text style={styles.text}>{label}</Text>
            <Animated.View style={[styles.switch, backgroundColorStyle]}>
                <Animated.View style={[styles.ellipse, ellipseStyle]}></Animated.View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 12,
    },
    switch: {
        width: 40,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
    },
    ellipse: {
        width: 16,
        height: 16,
        borderRadius: 12,
        backgroundColor: theme.color.white,
        marginLeft: 4,
    },
    text: {
        flex: 1,
        marginRight: 16,
        color: theme.color.gray7,
    },
    disabled: {
        opacity: 0.5,
    },
});
