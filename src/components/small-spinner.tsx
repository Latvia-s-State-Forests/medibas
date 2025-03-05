import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { SmallIcon } from "~/components/icon";

export function SmallSpinner() {
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
                <SmallIcon name="loading" color="transparent" />
            </Animated.View>
        </View>
    );
}

const style = StyleSheet.create({
    spinner: {
        width: 16,
        height: 16,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
});
