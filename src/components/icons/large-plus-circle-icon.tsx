import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type LargePlusCircleIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function LargePlusCircleIcon({ width = 32, height = 32, color = "gray8" }: LargePlusCircleIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 32 32" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.083 16C4.083 9.419 9.418 4.083 16 4.083 22.58 4.083 27.916 9.42 27.916 16c0 6.581-5.335 11.917-11.916 11.917C9.418 27.917 4.083 22.58 4.083 16ZM16 6.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75c5.384 0 9.75-4.365 9.75-9.75S21.384 6.25 16 6.25Zm0 4.333c.598 0 1.083.485 1.083 1.084v3.25h3.25a1.083 1.083 0 1 1 0 2.166h-3.25v3.25a1.083 1.083 0 1 1-2.167 0v-3.25h-3.25a1.083 1.083 0 0 1 0-2.166h3.25v-3.25c0-.599.485-1.084 1.084-1.084Z"
            />
        </Svg>
    );
}
