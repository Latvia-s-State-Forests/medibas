import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type ListItemProps = {
    label: string;
    hasTopBorder?: boolean;
    rightContent?: React.ReactNode;
};

export function ListItem(props: ListItemProps) {
    return (
        <View style={[styles.container, props.hasTopBorder && styles.topBorder]}>
            <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
                {props.label}
            </Text>
            <Spacer size={16} horizontal />
            {props.rightContent && <View style={styles.rightContent}>{props.rightContent}</View>}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
        paddingHorizontal: 16,
    },
    topBorder: {
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
    },
    label: {
        flex: 1,
    },
    rightContent: {
        marginRight: 16,
    },
});
