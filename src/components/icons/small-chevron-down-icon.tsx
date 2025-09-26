import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallChevronDownIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallChevronDownIcon({ width = 16, height = 16, color = "gray8" }: SmallChevronDownIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Path d="M8 11a.997.997 0 01-.707-.293l-3-3a1 1 0 111.414-1.414L8 8.586l2.293-2.293a1 1 0 011.414 1.414l-3 3A.997.997 0 018 11" />
        </Svg>
    );
}
