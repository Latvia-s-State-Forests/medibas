import * as React from "react";
import { View, StyleSheet } from "react-native";
import { match } from "ts-pattern";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type BorderlessBadgeProps = {
    count: number;
    variant?: "default" | "action-required" | "available" | "news-notification";
};

export function BorderlessBadge({ count, variant = "default" }: BorderlessBadgeProps) {
    const [height, setHeight] = React.useState(16);

    const digits = String(count).length;

    return (
        <View
            onLayout={(event) => {
                setHeight(event.nativeEvent.layout.height);
            }}
            style={[
                styles.container,
                match(variant)
                    .with("default", () => styles.default)
                    .with("action-required", () => styles.actionRequired)
                    .with("available", () => styles.available)
                    .with("news-notification", () => styles.newsNotification)
                    .exhaustive(),
                digits === 1 ? { width: height } : styles.multipleDigits,
                { borderRadius: height / 2 },
            ]}
        >
            <Text size={12} weight="bold" color="white" style={styles.count}>
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
        borderRadius: 8,
    },
    count: {
        lineHeight: 16,
    },
    multipleDigits: {
        paddingHorizontal: 6,
    },
    default: {
        backgroundColor: theme.color.greenActive,
    },
    actionRequired: {
        backgroundColor: theme.color.error,
    },
    available: {
        backgroundColor: theme.color.success,
    },
    newsNotification: {
        backgroundColor: theme.color.teal,
    },
});
