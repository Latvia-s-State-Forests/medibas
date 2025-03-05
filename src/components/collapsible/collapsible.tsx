import * as React from "react";
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { MediumIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type CollapsibleProps = {
    title: string;
    children: React.ReactNode;
    badgeCount?: number;
    badgeVariant?: React.ComponentProps<typeof BorderlessBadge>["variant"];
    defaultCollapsed?: boolean;
    lastInList?: boolean;
    style?: StyleProp<ViewStyle>;
};

export function Collapsible({
    title,
    children,
    badgeCount,
    badgeVariant,
    defaultCollapsed = true,
    lastInList = false,
    style,
}: CollapsibleProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    function onToggle() {
        setIsCollapsed((isCollapsed) => !isCollapsed);
    }

    return (
        <View style={(isCollapsed || !lastInList) && styles.bottomBorder}>
            <Pressable style={styles.container} onPress={onToggle}>
                <Text weight="bold" style={styles.title}>
                    {title}
                </Text>
                {badgeCount ? (
                    <>
                        <Spacer horizontal size={16} />
                        <BorderlessBadge variant={badgeVariant} count={badgeCount} />
                    </>
                ) : null}
                <Spacer horizontal size={16} />
                <MediumIcon color={"greenActive"} name={isCollapsed ? "chevronDown" : "chevronUp"} />
            </Pressable>
            {!isCollapsed ? <View style={[styles.collapsedContainer, style]}>{children}</View> : null}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        minHeight: 52,
        alignItems: "center",
        flexDirection: "row",
    },
    bottomBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
    },
    title: {
        flex: 1,
        paddingVertical: 15.5,
    },
    collapsedContainer: {
        paddingBottom: 16,
    },
});
