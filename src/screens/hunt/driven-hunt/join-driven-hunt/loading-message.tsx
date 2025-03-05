import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";

type Props = {
    title: string;
};

export function LoadingMessage({ title }: Props) {
    return (
        <View>
            <Spacer size={18} />
            <View style={styles.iconContainer}>
                <Spinner />
            </View>
            <Spacer size={24} />
            <Text size={22} weight="bold" style={styles.title}>
                {title}
            </Text>
            <Spacer size={18} />
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: "center",
    },
    title: {
        textAlign: "center",
    },
});
