import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type LargeFeederIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function LargeFeederIcon({ width = 32, height = 32, color = "gray8" }: LargeFeederIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 32 32" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.496 3.136a1 1 0 0 1 1.008 0l12 7A1 1 0 0 1 28 12h-4.21l-5.979 9.09H19a1 1 0 1 1 0 2h-1.102l2.867 4.36a1 1 0 0 1-1.67 1.1L16 23.843l-3.095 4.705a1 1 0 1 1-1.67-1.098l2.867-4.361H13a1 1 0 1 1 0-2h1.189L8.21 12H4a1 1 0 0 1-.504-1.864l12-7ZM10.604 12 16 20.204 21.395 12h-10.79Zm12.662-2H7.699L16 5.158 24.301 10h-1.035Z"
            />
        </Svg>
    );
}
