import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "~/components/action-button";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function ActionButtonExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Action Button" />
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
                <Text>Static buttons preview</Text>
                <Spacer size={16} />
                <ActionButton title="Continue hunting" onPress={ignore} iconName="play" />
                <Spacer size={8} />
                <ActionButton disabled={true} title="Continue hunting" onPress={ignore} iconName="play" />
                <Spacer size={16} />
                <ActionButton title="Pause hunting" onPress={ignore} iconName="pause" />
                <Spacer size={8} />
                <ActionButton disabled={true} title="Pause hunting" onPress={ignore} iconName="pause" />
                <Spacer size={16} />
                <ActionButton title="Conclude hunting" onPress={ignore} iconName="unlock" />
                <Spacer size={8} />
                <ActionButton disabled={true} title="Conclude hunting" onPress={ignore} iconName="unlock" />
                <Spacer size={16} />
                <ActionButton title="Decline" onPress={ignore} iconName="blocked" iconColor="gray5" />
                <Spacer size={8} />
                <ActionButton title="Decline" onPress={ignore} iconName="blocked" iconColor="gray5" disabled={true} />
                <Spacer size={16} />
                <ActionButton title="Accept" onPress={ignore} iconName="check" iconColor="success" />
                <Spacer size={8} />
                <ActionButton title="Accept" onPress={ignore} iconName="check" iconColor="success" disabled={true} />
                <Spacer size={16} />
                <Text>Buttons in a row</Text>
                <Spacer size={16} />
                <View style={styles.buttonRow}>
                    <ActionButton title="Decline" onPress={ignore} iconName="blocked" iconColor="gray5" />
                    <Spacer horizontal size={10} />
                    <ActionButton title="Accept" onPress={ignore} iconName="check" iconColor="success" />
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
    buttonRow: {
        flexDirection: "row",
    },
});
