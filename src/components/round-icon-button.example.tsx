import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { RoundIconButton } from "~/components/round-icon-button";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function RoundIconButtonExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Round Icon Button" />
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
                <Text>Buttons with elevation low</Text>
                <Spacer size={16} />
                <View style={styles.row}>
                    <RoundIconButton onPress={ignore} name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton onPress={ignore} appearance="active" name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton onPress={ignore} appearance="background" name="plus" />
                </View>
                <Spacer size={20} />
                <View style={styles.row}>
                    <RoundIconButton disabled onPress={ignore} name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton disabled onPress={ignore} appearance="active" name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton disabled onPress={ignore} appearance="background" name="plus" />
                </View>
                <Spacer size={20} />
                <Text>Buttons with elevation high</Text>
                <Spacer size={16} />
                <View style={styles.row}>
                    <RoundIconButton elevation="high" onPress={ignore} appearance="default" name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton elevation="high" onPress={ignore} appearance="active" name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton elevation="high" onPress={ignore} appearance="background" name="plus" />
                </View>
                <Spacer size={20} />
                <View style={styles.row}>
                    <RoundIconButton elevation="high" disabled onPress={ignore} appearance="default" name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton elevation="high" disabled onPress={ignore} appearance="active" name="plus" />
                    <Spacer horizontal size={20} />
                    <RoundIconButton elevation="high" disabled onPress={ignore} appearance="background" name="plus" />
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
