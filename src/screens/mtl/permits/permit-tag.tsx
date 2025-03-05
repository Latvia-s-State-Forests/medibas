import * as React from "react";
import { View, StyleSheet } from "react-native";
import PermitTagIcon from "~/assets/icons/other/permit-tag.svg";
import { Text } from "~/components/text";
import { theme } from "~/theme";

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
            <PermitTagIcon
                fill={variant === "available" ? theme.color.success : theme.color.gray3}
                width={40}
                height={24}
            />
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
