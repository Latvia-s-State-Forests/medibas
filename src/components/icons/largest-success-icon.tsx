import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type LargestSuccessIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function LargestSuccessIcon({ width = 96, height = 96, color = "success" }: LargestSuccessIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 96 96" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M44 58.667c-.442 0-.867-.175-1.179-.488l-9.333-9.334a1.664 1.664 0 0 1 .54-2.718 1.665 1.665 0 0 1 1.816.362L44 54.644l16.155-16.155a1.665 1.665 0 0 1 2.357 0c.652.65.652 1.705 0 2.356L45.18 58.18a1.661 1.661 0 0 1-1.179.488v-.001Z"
            />
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48 92c24.3 0 44-19.7 44-44S72.3 4 48 4 4 23.7 4 48s19.7 44 44 44Zm0-4c22.091 0 40-17.909 40-40S70.091 8 48 8 8 25.909 8 48s17.909 40 40 40Z"
            />
        </Svg>
    );
}
