import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallDeniedIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallDeniedIcon({ width = 16, height = 16, color = "gray8" }: SmallDeniedIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M14 8A6 6 0 1 0 2 8a6 6 0 0 0 12 0Zm2 0A8 8 0 1 0 0 8a8 8 0 0 0 16 0Z"
                clipRule="evenodd"
            />
            <Path d="m5.292 9.292-.083.094a1 1 0 0 0 1.497 1.32l1.293-1.293 1.293 1.293.094.083a1 1 0 0 0 1.32-1.497L9.413 7.999l1.293-1.293.083-.094a1 1 0 0 0-1.497-1.32L7.999 6.585 6.706 5.292l-.094-.083a1 1 0 0 0-1.32 1.497L6.584 8 5.292 9.292Z" />
        </Svg>
    );
}
