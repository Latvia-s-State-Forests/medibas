import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/text";
import { SmallIcon } from "./icon";
import { Spacer } from "./spacer";

type ErrorMessageProps = {
    text: string;
};

export function ErrorMessage({ text }: ErrorMessageProps) {
    return (
        <View style={styles.row}>
            <SmallIcon name="error" color="error" />
            <Spacer horizontal size={16} />
            <Text style={styles.text} color="gray7">
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    text: {
        flex: 1,
    },
});
