import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type OtherPermitTagIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function OtherPermitTagIcon({ width = 22, height = 14, color = "gray8" }: OtherPermitTagIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 22 14" fill={fillColor}>
            <Path d="M19.502 0C20.902 0 22 1.199 22 2.637v8.726C22 12.799 20.9 14 19.502 14H7c-1.124 0-2.532-.673-3.28-1.558L.642 8.802c-.856-1.011-.856-2.592 0-3.604l3.077-3.641C4.47.67 5.872 0 7 0h12.503Z" />
        </Svg>
    );
}
