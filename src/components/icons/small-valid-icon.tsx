import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallValidIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallValidIcon({ width = 16, height = 16, color = "gray8" }: SmallValidIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 11a.997.997 0 0 1-.707-.293l-2-2a1 1 0 0 1 1.414-1.414L7 8.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4A.996.996 0 0 1 7 11Z"
            />
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 14A6 6 0 1 0 8 1.999 6 6 0 0 0 8 14Zm0 2A8 8 0 1 0 8-.001 8 8 0 0 0 8 16Z"
            />
        </Svg>
    );
}
