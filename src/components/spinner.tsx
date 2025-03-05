import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { LargestIcon } from "~/components/icon";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type SpinnerProps = {
    progress?: number;
};

export function Spinner({ progress }: SpinnerProps) {
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 1100, easing: Easing.linear }), -1);
    }, [rotation]);

    const styles = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    return (
        <View style={style.spinner}>
            <Animated.View style={styles}>
                <LargestIcon name="loading" />
            </Animated.View>

            {progress !== undefined && <Text style={style.progressText}>{progress}%</Text>}
        </View>
    );
}

const style = StyleSheet.create({
    spinner: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    progressText: {
        fontSize: theme.fontSize[20],
        position: "absolute",
        color: theme.color.gray8,
        fontVariant: ["tabular-nums"],
    },
});
