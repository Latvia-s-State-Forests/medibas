import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import {
    icons,
    LargeIcon,
    LargeIconName,
    LargestIcon,
    LargestIconName,
    MediumIcon,
    MediumIconName,
    SmallIcon,
    SmallIconName,
} from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function IconExampleScreen() {
    const insets = useSafeAreaInsets();
    const smallIcons = Object.keys(icons[16]) as SmallIconName[];
    const mediumIcons = Object.keys(icons[24]) as MediumIconName[];
    const largeIcons = Object.keys(icons[32]) as LargeIconName[];
    const largestIcons = Object.keys(icons[96]) as LargestIconName[];

    return (
        <View style={styles.container}>
            <Header title="Icon" />
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
                <Text>Icons size 16</Text>
                <Spacer size={16} />
                <View style={styles.iconsContainer}>
                    {smallIcons.map((name) => {
                        return <SmallIcon key={name} name={name} />;
                    })}
                </View>
                <Spacer size={16} />
                <Text>Icons size 24</Text>
                <Spacer size={16} />
                <View style={styles.iconsContainer}>
                    {mediumIcons.map((name) => {
                        return <MediumIcon key={name} name={name} />;
                    })}
                </View>
                <Spacer size={16} />
                <Text>Icons size 32</Text>
                <Spacer size={16} />
                <View style={styles.iconsContainer}>
                    {largeIcons.map((name) => {
                        return <LargeIcon key={name} name={name} />;
                    })}
                </View>
                <Spacer size={16} />
                <Text>Icons size 96</Text>
                <Spacer size={16} />
                <View style={styles.iconsContainer}>
                    {largestIcons.map((name) => {
                        return <LargestIcon key={name} name={name} />;
                    })}
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
    iconsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
});
