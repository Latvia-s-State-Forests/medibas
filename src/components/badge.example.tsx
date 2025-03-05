import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "~/components/badge";
import { BorderlessBadge } from "~/components/borderless-badge";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function BadgeExampleScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Header title="Badge" />
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
                <Text>Default badge</Text>
                <Spacer size={8} />
                <View style={styles.row}>
                    <Badge count={1} />
                    <Spacer size={8} horizontal />
                    <Badge count={12} />
                    <Spacer size={8} horizontal />
                    <Badge count={123} />
                </View>

                <Spacer size={24} />

                <Text>Action required badge</Text>
                <Spacer size={8} />
                <View style={styles.row}>
                    <Badge count={1} variant="action-required" />
                    <Spacer size={8} horizontal />
                    <Badge count={12} variant="action-required" />
                    <Spacer size={8} horizontal />
                    <Badge count={123} variant="action-required" />
                </View>

                <Spacer size={24} />

                <Text>Default borderless badge</Text>
                <Spacer size={8} />
                <View style={styles.row}>
                    <BorderlessBadge count={1} />
                    <Spacer size={8} horizontal />
                    <BorderlessBadge count={12} />
                    <Spacer size={8} horizontal />
                    <BorderlessBadge count={123} />
                </View>

                <Spacer size={24} />

                <Text>Action required borderless badge</Text>
                <Spacer size={8} />
                <View style={styles.row}>
                    <BorderlessBadge count={1} variant="action-required" />
                    <Spacer size={8} horizontal />
                    <BorderlessBadge count={12} variant="action-required" />
                    <Spacer size={8} horizontal />
                    <BorderlessBadge count={123} variant="action-required" />
                </View>

                <Spacer size={24} />

                <Text>Available borderless badge</Text>
                <Spacer size={8} />
                <View style={styles.row}>
                    <BorderlessBadge count={1} variant="available" />
                    <Spacer size={8} horizontal />
                    <BorderlessBadge count={12} variant="available" />
                    <Spacer size={8} horizontal />
                    <BorderlessBadge count={123} variant="available" />
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
