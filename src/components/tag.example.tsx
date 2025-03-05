import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Tag } from "~/components/tag";
import { theme } from "~/theme";

export function TagExampleScreen() {
    const insets = useSafeAreaInsets();
    return (
        <View style={styles.container}>
            <Header title="Tag" />
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
                <Tag label="Tag" />
                <Spacer size={16} />
                <Tag label="Extended length tag" />
                <Spacer size={16} />
                <Tag label="Super     extended     length     tag" />
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
