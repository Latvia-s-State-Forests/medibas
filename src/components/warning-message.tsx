import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/text";
import { SmallIcon } from "./icon";
import { Spacer } from "./spacer";

type WarningMessageProps = {
    text: string;
};

export function WarningMessage({ text }: WarningMessageProps) {
    return (
        <View style={styles.row}>
            <SmallIcon name="error" color="information" />
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
