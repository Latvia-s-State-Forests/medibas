import * as React from "react";
import { StyleProp, TextStyle } from "react-native";
import { Text } from "~/components/text";

type FieldLabelProps = {
    label: string;
    style?: StyleProp<TextStyle>;
};

export function FieldLabel({ label, style }: FieldLabelProps) {
    return (
        <Text size={12} color="gray7" weight="bold" style={style}>
            {label}
        </Text>
    );
}
