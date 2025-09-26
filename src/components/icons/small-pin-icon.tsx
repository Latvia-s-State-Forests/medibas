import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallPinIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallPinIcon({ width = 16, height = 16, color = "gray8" }: SmallPinIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Path d="M10 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 3a4 4 0 0 0-4 4c0 .94.171 1.616.48 2.112.318.51.972 1.307 1.774 2.163.6.639 1.22 1.246 1.743 1.712 1.235-1.109 2.878-2.888 3.494-3.875C11.816 8.59 12 7.898 12 7a4 4 0 0 0-4-4Zm5.188 7.17C13.761 9.25 14 8.164 14 7A6 6 0 0 0 2 7c0 1.164.21 2.25.783 3.17.85 1.363 3.049 3.647 4.402 4.755a1.255 1.255 0 0 0 1.628-.001c1.346-1.11 3.526-3.392 4.375-4.754Z"
            />
        </Svg>
    );
}
