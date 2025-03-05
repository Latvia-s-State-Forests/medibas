import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { QRContainer } from "~/components/qr-code/qr-container";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function QRContainerExampleScreen() {
    const insets = useSafeAreaInsets();
    const value = "https://www.github.com";
    return (
        <View style={styles.container}>
            <Header title="QR code Container" />
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
                <Text>QRContainer with title</Text>
                <Spacer size={16} />
                <QRContainer title="Title" value={value} />
                <Spacer size={24} />
                <Text>QRContainer with title and description</Text>
                <Spacer size={16} />
                <QRContainer title="Title" description="Description" value={value} />
                <Spacer size={24} />
                <Text>QRContainer without background</Text>
                <Spacer size={16} />
                <QRContainer title="Title" background={false} value={value} />
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
