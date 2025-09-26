import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumPlayIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumPlayIcon({ width = 24, height = 24, color = "gray8" }: MediumPlayIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M8.002 5.175v.002Zm-.561.31Zm.559.35L17.727 12 8 18.163V5.836Zm-.56 12.68h.003-.003Zm.562.308ZM6.817 3.681c.628-.343 1.289-.146 1.733.136l10.566 6.695c.48.304.884.82.884 1.489 0 .669-.405 1.183-.884 1.486L8.55 20.183c-.443.28-1.104.48-1.733.136C6.187 19.974 6 19.308 6 18.78V5.218c0-.528.188-1.192.817-1.537Z"
                clipRule="evenodd"
            />
        </Svg>
    );
}
