import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumPolygonIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumPolygonIcon({ width = 24, height = 24, color = "gray8" }: MediumPolygonIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path d="M7 6.5A1.5 1.5 0 1 0 5.5 8v2a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7V8A1.5 1.5 0 0 0 7 6.5ZM20 6.5A1.5 1.5 0 1 0 18.5 8v2a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7V8A1.5 1.5 0 0 0 20 6.5ZM20 17.5a1.5 1.5 0 1 0-1.5 1.5v2a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7v-2a1.5 1.5 0 0 0 1.5-1.5ZM7 17.5A1.5 1.5 0 1 0 5.5 19v2a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7v-2A1.5 1.5 0 0 0 7 17.5Z" />
            <Path d="M6.5 14.5h-2v-6h2v6ZM16 16.5v2H8v-2h8ZM16 5.5v2H8v-2h8ZM19.5 15h-2V9h2v6Z" />
        </Svg>
    );
}
