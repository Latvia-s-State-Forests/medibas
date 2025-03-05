import * as React from "react";
import { View, StyleSheet, Pressable, StyleProp, ViewStyle, LayoutChangeEvent } from "react-native";
import { MediumIcon } from "~/components/icon";
import { IconButton } from "~/components/icon-button";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type ObservationsCollapsibleProps = {
    title: string;
    children: React.ReactNode;
    onDeletePress: () => void;
    defaultCollapsed?: boolean;
    lastInList?: boolean;
    style?: StyleProp<ViewStyle>;
    onLayout?: (event: LayoutChangeEvent) => void;
};

export function ObservationsCollapsible({
    title,
    style,
    children,
    onDeletePress,
    defaultCollapsed = true,
    lastInList = false,
    onLayout,
}: ObservationsCollapsibleProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    function onToggle() {
        setIsCollapsed((isCollapsed) => !isCollapsed);
    }

    return (
        <View style={(isCollapsed || !lastInList) && styles.bottomBorder} onLayout={onLayout}>
            <Pressable style={styles.container} onPress={onToggle}>
                <MediumIcon color={"greenActive"} name={isCollapsed ? "chevronDown" : "chevronUp"} />
                <Spacer horizontal size={16} />
                <Text style={styles.text} weight="bold">
                    {title}
                </Text>
                <Spacer horizontal size={16} />
                <IconButton style={styles.deleteButton} onPress={onDeletePress} color={"gray5"} name={"trash"} />
            </Pressable>
            {!isCollapsed && <View style={[styles.collapsedContainer, style]}>{children}</View>}
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
    text: {
        flex: 1,
        paddingVertical: 15.5,
    },
    deleteButton: {
        paddingRight: 0,
    },
    collapsedContainer: {
        paddingBottom: 16,
    },
});
