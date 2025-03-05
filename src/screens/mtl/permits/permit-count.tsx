import * as React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { MediumIcon } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";

type PermitCountProps = {
    title: string;
    isEditable?: boolean;
    count: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
};

export function PermitCount({ title, isEditable = false, count, onPress, style }: PermitCountProps) {
    return (
        <Pressable onPress={onPress} style={[styles.row, style]}>
            <Text style={styles.titleText} weight="bold" color="gray5" size={12}>
                {title}
            </Text>
            {isEditable ? (
                <View style={styles.rowContent}>
                    <MediumIcon onPress={onPress} color="greenActive" name="edit" />
                    <Spacer horizontal size={20} />
                    <Text style={styles.countText}>{count}</Text>
                </View>
            ) : (
                <Text style={styles.countText}>{count}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        height: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    titleText: {
        lineHeight: 15.6,
    },
    countText: {
        lineHeight: 20,
    },
});
