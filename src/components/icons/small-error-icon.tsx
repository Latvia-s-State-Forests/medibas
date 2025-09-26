import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallErrorIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallErrorIcon({ width = 16, height = 16, color = "gray8" }: SmallErrorIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M8 0c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8Zm0 2C4.691 2 2 4.691 2 8s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6Zm0 7.947a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM8 3.5a1 1 0 0 1 1 1v3.447a1 1 0 0 1-2 0V4.5a1 1 0 0 1 1-1Z"
                clipRule="evenodd"
            />
        </Svg>
    );
}
