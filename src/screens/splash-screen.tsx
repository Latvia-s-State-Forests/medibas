import * as React from "react";
import { StyleSheet, View } from "react-native";
import { OtherSplashIcon } from "~/components/icons/other-splash-icon";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";

export function SplashScreen() {
    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <OtherSplashIcon width={150} />
            </View>
        </ScreenBackgroundLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
