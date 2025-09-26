import * as React from "react";
import { Pressable, View, StyleSheet, Platform } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { LargeIcon, LargeIconName } from "~/components/icon";
import { theme } from "~/theme";
import { Text } from "../../components/text";

export type StatisticsSummaryRowProps = {
    title: string;
    count: number;
    onPress: () => void;
    iconName?: LargeIconName;
    disabled?: boolean;
};

export function StatisticsSummaryRow(props: StatisticsSummaryRowProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed ? styles.pressed : styles.shadow,
                props.disabled && styles.disabled,
            ]}
            onPress={props.onPress}
            disabled={props.disabled}
        >
            {props.iconName ? (
                <View style={styles.iconContainer}>
                    <LargeIcon name={props.iconName} />
                </View>
            ) : null}
            <Text style={styles.title}>{props.title}</Text>
            <BorderlessBadge count={props.count} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: theme.color.white,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        alignItems: "center",
    },
    pressed: {
        backgroundColor: theme.color.gray2,
    },
    shadow: {
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.08,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    disabled: {
        opacity: 0.5,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    title: {
        flex: 1,
        lineHeight: 20,
        marginRight: 16,
    },
});
