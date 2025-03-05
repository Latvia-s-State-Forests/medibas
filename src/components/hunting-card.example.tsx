import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { HuntingCard } from "~/components/hunting-card";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function HuntingCardExampleScreen() {
    const insets = useSafeAreaInsets();
    const QRCodeValue = "https://www.google.com";

    function ignore() {
        //do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Hunting Card" />
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
                <Text>Hunting Cards with name</Text>
                <Spacer size={16} />
                <HuntingCard
                    onPress={ignore}
                    title="MK_002, Aizputed iecirknis"
                    name="Jānis Bērziņš"
                    date="16.11.2022."
                    status="active"
                    hasQRCode
                    QRCodeValue={QRCodeValue}
                />
                <Spacer size={8} />
                <HuntingCard
                    onPress={ignore}
                    title="MK_002, Ogres iecirknis"
                    name="Jānis Bērziņš"
                    date="16.11.2022. 8.15 - 17.53"
                    hasQRCode
                    QRCodeValue={QRCodeValue}
                />
                <Spacer size={8} />
                <HuntingCard
                    onPress={ignore}
                    title="MK_002, Aizputed iecirknis"
                    name="Jānis Bērziņš"
                    date="16.11.2022."
                    status="pause"
                    hasQRCode
                    QRCodeValue={QRCodeValue}
                />
                <Spacer size={8} />
                <HuntingCard
                    onPress={ignore}
                    title="MK_002, Ogres iecirknis"
                    name="Jānis Bērziņš"
                    date="16.11.2022. 8.15 - 17.53"
                />
                <Spacer size={24} />
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
