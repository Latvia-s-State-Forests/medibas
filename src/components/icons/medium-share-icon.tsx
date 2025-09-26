import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumShareIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumShareIcon({ width = 24, height = 24, color = "gray8" }: MediumShareIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M17.15 4a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM13.9 5.25a3.25 3.25 0 1 1 1.155 2.484l-4.649 3.487a3.26 3.26 0 0 1 0 1.559l4.648 3.486a3.25 3.25 0 1 1-1.06 1.705l-4.648-3.487a3.25 3.25 0 1 1 0-4.968l4.648-3.486a3.256 3.256 0 0 1-.094-.78Zm3.25 12.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM6 12a1.25 1.25 0 1 1 2.5 0A1.25 1.25 0 0 1 6 12Z"
                clipRule="evenodd"
            />
        </Svg>
    );
}
