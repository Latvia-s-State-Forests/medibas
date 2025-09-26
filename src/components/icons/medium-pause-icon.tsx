import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumPauseIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumPauseIcon({ width = 24, height = 24, color = "gray8" }: MediumPauseIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M7.5 6c-.279 0-.5.224-.5.498v11.004c0 .27.225.498.5.498h1c.279 0 .5-.224.5-.498V6.498A.502.502 0 0 0 8.5 6h-1ZM5 6.498A2.498 2.498 0 0 1 7.5 4h1C9.88 4 11 5.123 11 6.498v11.004A2.498 2.498 0 0 1 8.5 20h-1A2.502 2.502 0 0 1 5 17.502V6.498ZM15.5 6c-.279 0-.5.224-.5.498v11.004c0 .27.225.498.5.498h1c.279 0 .5-.224.5-.498V6.498A.502.502 0 0 0 16.5 6h-1Zm-2.5.498A2.498 2.498 0 0 1 15.5 4h1C17.88 4 19 5.123 19 6.498v11.004A2.498 2.498 0 0 1 16.5 20h-1a2.502 2.502 0 0 1-2.5-2.498V6.498Z"
                clipRule="evenodd"
            />
        </Svg>
    );
}
