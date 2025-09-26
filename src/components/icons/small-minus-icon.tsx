import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallMinusIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallMinusIcon({ width = 16, height = 16, color = "gray8" }: SmallMinusIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Path d="M14 7C14.2564 6.99797 14.5038 7.09454 14.6911 7.26974C14.8784 7.44494 14.9912 7.68539 15.0062 7.94139C15.0212 8.1974 14.9373 8.44939 14.7718 8.64529C14.6063 8.84119 14.3719 8.96602 14.117 8.994L14 9H1.99999C1.74511 8.99972 1.49996 8.90212 1.31462 8.72715C1.12929 8.55218 1.01776 8.31305 1.00282 8.05861C0.987882 7.80416 1.07067 7.55362 1.23426 7.35817C1.39785 7.16272 1.62989 7.0371 1.88299 7.007L1.99999 7H14Z" />
        </Svg>
    );
}
