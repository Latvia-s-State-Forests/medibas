import * as React from "react";
import { DimensionValue, View } from "react-native";

type SpacerProps = {
    size: DimensionValue; // 24 or 50%
    horizontal?: boolean;
};

export function Spacer({ size, horizontal }: SpacerProps) {
    const defaultValue = "auto";
    return (
        <View
            style={{
                width: horizontal ? size : defaultValue,
                height: !horizontal ? size : defaultValue,
            }}
        />
    );
}
