import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumStatsIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumStatsIcon({ width = 24, height = 24, color = "gray8" }: MediumStatsIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path d="M3 7.93a1 1 0 0 1 2 0v10h13.5a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1v-11Zm15.94-3.914a1 1 0 0 1 1.136.709l1.004 3.499a1 1 0 0 1-1.923.551l-.303-1.057-4.15 8.166a1 1 0 0 1-1.806-.05l-1.803-4.084-2.962 4.252a1 1 0 1 1-1.64-1.144l3.979-5.71a1 1 0 0 1 1.735.168l1.669 3.783 3.308-6.507-1.294.37a1 1 0 0 1-.55-1.924l3.5-1 .1-.022Z" />
        </Svg>
    );
}
