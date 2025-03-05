import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { Spinner } from "~/components/spinner";
import { theme } from "~/theme";

export function LoadingScreen() {
    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <Spinner />
            </View>
        </ScreenBackgroundLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingVertical: 34,
        borderRadius: 8,
        backgroundColor: theme.color.white,
    },
});
