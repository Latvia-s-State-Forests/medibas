import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumScanIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumScanIcon({ width = 24, height = 24, color = "gray8" }: MediumScanIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 5.203C5 5.09 5.09 5 5.203 5H8a1 1 0 0 0 0-2H5.203A2.202 2.202 0 0 0 3 5.203V8a1 1 0 0 0 2 0V5.203ZM18.797 3H16a1 1 0 1 0 0 2h2.797c.113 0 .203.09.203.203V8a1 1 0 1 0 2 0V5.203A2.202 2.202 0 0 0 18.797 3ZM5 16a1 1 0 1 0-2 0v2.797C3 20.017 3.987 21 5.203 21H8a1 1 0 1 0 0-2H5.203A.202.202 0 0 1 5 18.797V16Zm16 0a1 1 0 1 0-2 0v2.797c0 .113-.09.203-.203.203H16a1 1 0 1 0 0 2h2.797A2.202 2.202 0 0 0 21 18.797V16ZM3 11a1 1 0 1 0 0 2h18a1 1 0 1 0 0-2H3Z"
            />
        </Svg>
    );
}
