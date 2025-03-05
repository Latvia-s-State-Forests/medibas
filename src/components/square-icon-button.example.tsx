import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { SquareIconButton } from "~/components/square-icon-button";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function SquareIconButtonExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Square Icon Button" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <Text>Square Button</Text>
                <Spacer size={16} />
                <View style={styles.row}>
                    <SquareIconButton onPress={ignore} name="mapLayers" />
                </View>
                <Spacer size={16} />
                <Text>Square Button Disabled</Text>
                <Spacer size={16} />
                <View style={styles.row}>
                    <SquareIconButton disabled onPress={ignore} name="mapLayers" />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingTop: 24,
    },
    row: {
        flexDirection: "row",
    },
});
