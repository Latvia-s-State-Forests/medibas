import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallLoadingIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallLoadingIcon({ width = 16, height = 16, color = "transparent" }: SmallLoadingIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Circle cx="8" cy="8" r="7" stroke="#77844F" strokeOpacity="0.5" strokeWidth="2" />
            <Path
                d="M8 1C11.866 1 15 4.13401 15 8C15 9.90731 14.2372 11.6364 13 12.899"
                stroke="#77844F"
                strokeWidth="2"
            />
        </Svg>
    );
}
