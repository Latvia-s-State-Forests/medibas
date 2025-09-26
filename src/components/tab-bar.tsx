import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "~/components/badge";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type TabBarProps = {
    children: React.ReactNode;
};

export function TabBar({ children }: TabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        borderTopWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
});

type TabBarItemProps = {
    label: string;
    icon: MediumIconName;
    onPress: () => void;
    badgeCount?: number;
    active: boolean;
};

export function TabBarItem({ label, icon, onPress, badgeCount, active }: TabBarItemProps) {
    return (
        <Pressable onPress={onPress} style={itemStyles.container}>
            <View style={itemStyles.badge}>
                {badgeCount && badgeCount > 0 ? <Badge variant="action-required" count={badgeCount} /> : null}
            </View>
            <MediumIcon color={active ? "teal" : "gray8"} name={icon} />
            <Text
                color={active ? "teal" : "gray8"}
                size={12}
                style={itemStyles.text}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {label}
            </Text>
        </Pressable>
    );
}
const itemStyles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        alignItems: "center",
        paddingVertical: 10,
    },
    badge: {
        position: "absolute",
        top: -12,
        zIndex: 2,
    },
    text: {
        textAlign: "center",
    },
});
