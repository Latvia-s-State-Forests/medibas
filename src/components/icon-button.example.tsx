import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { IconButton } from "~/components/icon-button";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function IconButtonExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Icon Button" />
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
                <Text>Default icon button</Text>
                <IconButton name="binoculars" onPress={ignore} />
                <Spacer size={16} />
                <Text>Disabled icon button</Text>
                <IconButton name="binoculars" onPress={ignore} disabled />
                <Spacer size={24} />
                <Text>Custom color icon button</Text>
                <IconButton name="camera" onPress={ignore} color="greenActive" />
                <Spacer size={16} />
                <Text>Disabled custom color icon button</Text>
                <IconButton name="camera" onPress={ignore} color="greenActive" disabled />
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
});
