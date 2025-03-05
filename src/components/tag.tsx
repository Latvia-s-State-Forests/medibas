import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type TagProps = {
    label: string;
};

export function Tag({ label }: TagProps) {
    return (
        <View style={styles.tag}>
            <Text numberOfLines={1} ellipsizeMode={"tail"} style={styles.text} weight="bold" size={12}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    tag: {
        textAlign: "center",
        alignSelf: "flex-start",
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: theme.color.green,
    },
    text: {
        textTransform: "uppercase",
        color: theme.color.white,
        lineHeight: 16,
    },
});
