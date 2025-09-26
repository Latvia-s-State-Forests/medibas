import * as React from "react";
import { View, StyleSheet } from "react-native";
import { OtherPermitTagIcon } from "~/components/icons/other-permit-tag-icon";
import { Text } from "~/components/text";

type PermitTagProps = {
    count: number;
    variant: "available" | "issued";
};

export function PermitTag({ variant, count }: PermitTagProps) {
    return (
        <View style={styles.container}>
            <Text size={12} style={styles.text} color={"white"} weight="bold">
                {count}
            </Text>
            <OtherPermitTagIcon color={variant === "available" ? "success" : "gray3"} width={40} height={24} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    text: {
        ...StyleSheet.absoluteFillObject,
        lineHeight: 24,
        textAlign: "center",
        textAlignVertical: "center",
        zIndex: 1,
    },
});
