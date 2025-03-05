import * as React from "react";
import { StyleSheet, View } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { FieldLabel } from "~/components/field-label";

type FieldLabelWithBadgeProps = {
    count: number;
    label: string;
};

export function FieldLabelWithBadge(props: FieldLabelWithBadgeProps) {
    return (
        <View style={styles.container}>
            <FieldLabel label={props.label} />
            <View>
                <BorderlessBadge variant="default" count={props.count} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: 20,
    },
});
