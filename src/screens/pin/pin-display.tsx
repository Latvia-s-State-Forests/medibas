import * as React from "react";
import { StyleSheet, Animated, View } from "react-native";
import { theme } from "~/theme";

type PinDisplayProps = {
    length: number;
    filled: number;
};

export function PinDisplay({ length, filled }: PinDisplayProps) {
    function circles() {
        const result = [];
        for (let i = 1; i <= length; i++) {
            result.push(i);
        }
        return result;
    }

    return (
        <View style={styles.circleContainer}>
            {circles().map((c) => (
                <PinCircle key={`pin${c}`} filled={filled >= c} />
            ))}
        </View>
    );
}

type PinCircleProps = {
    filled: boolean;
};

function PinCircle({ filled }: PinCircleProps) {
    const fadeAnimation = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnimation, {
            toValue: filled ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [fadeAnimation, filled]);

    const animatedBkg = fadeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.color.gray1, theme.color.success],
    });

    return <Animated.View style={[styles.circle, { backgroundColor: animatedBkg }]} />;
}

const styles = StyleSheet.create({
    circleContainer: {
        flexDirection: "row",
    },
    circle: {
        width: 28,
        height: 28,
        marginHorizontal: 8,
        borderRadius: 17,
    },
});
