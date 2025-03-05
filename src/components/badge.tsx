import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type BadgeProps = {
    count: number;
    variant?: "default" | "action-required";
};

export function Badge({ variant = "default", count }: BadgeProps) {
    const [height, setHeight] = React.useState(24);

    const digits = String(count).length;

    return (
        <View
            onLayout={(event) => {
                setHeight(event.nativeEvent.layout.height);
            }}
            style={[
                styles.container,
                variant === "default" ? styles.default : styles.actionRequired,
                digits === 1 ? { width: height } : styles.multipleDigits,
                { borderRadius: height / 2 },
            ]}
        >
            <Text
                size={12}
                weight="bold"
                style={[styles.count, variant === "default" ? styles.defaultText : styles.actionRequiredText]}
            >
                {count}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        borderRadius: 12,
        borderWidth: 3,
    },
    count: {
        lineHeight: 16,
    },
    multipleDigits: {
        paddingHorizontal: 6,
    },
    default: {
        backgroundColor: theme.color.white,
        borderColor: theme.color.greenActive,
    },
    defaultText: {
        color: theme.color.gray8,
    },
    actionRequired: {
        backgroundColor: theme.color.error,
        borderColor: theme.color.white,
    },
    actionRequiredText: {
        color: theme.color.white,
    },
});
