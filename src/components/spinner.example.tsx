import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function SpinnerExampleScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Header title="Spinner" />
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
                <Text>Spinner</Text>
                <Spacer size={16} />
                <Spinner />

                <Spacer size={16} />

                <Text>Spinner (with progress)</Text>
                <Spacer size={16} />
                <Spinner progress={25} />
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
