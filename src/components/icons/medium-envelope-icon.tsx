import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumEnvelopeIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumEnvelopeIcon({ width = 24, height = 24, color = "gray8" }: MediumEnvelopeIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 7.5v9A2.5 2.5 0 0 0 4.5 19h15a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 19.5 5h-15A2.5 2.5 0 0 0 2 7.5Zm2 1.647V16.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V9.147l-7.265 4.087a1.5 1.5 0 0 1-1.47 0L4 9.147Zm.32-2.114 7.68 4.32 7.68-4.32A.498.498 0 0 0 19.5 7h-15a.499.499 0 0 0-.18.033Z"
            />
        </Svg>
    );
}
