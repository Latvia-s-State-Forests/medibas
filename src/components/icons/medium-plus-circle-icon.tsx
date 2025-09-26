import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumPlusCircleIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumPlusCircleIcon({ width = 24, height = 24, color = "gray8" }: MediumPlusCircleIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12Zm11-9a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H8a1 1 0 1 1 0-2h3V8a1 1 0 0 1 1-1Z"
            />
        </Svg>
    );
}
