import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { LargeIconName, MediumIcon } from "~/components/icon";
import { ReadOnlyField } from "~/components/read-only-field";
import { theme } from "~/theme";

export type StatisticsHuntInfoCardProps = {
    title: string;
    count?: number;
    value: string;
    onPress: () => void;
    iconName?: LargeIconName;
    disabled?: boolean;
};

export function StatisticsHuntInfoCard(props: StatisticsHuntInfoCardProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.container, !props.disabled && pressed ? styles.pressed : styles.shadow]}
            onPress={props.onPress}
            disabled={!props.count}
        >
            <View style={styles.textContent}>
                <ReadOnlyField label={props.title} value={props.value} />
            </View>
            {props.count && props.count > 0 ? (
                <View style={styles.iconContainer}>
                    <MediumIcon color="gray5" name="chevronRight" />
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: theme.color.white,
        paddingVertical: 16,
        paddingLeft: 16,
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
    textContent: {
        flex: 1,
        paddingRight: 16,
    },
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
});
