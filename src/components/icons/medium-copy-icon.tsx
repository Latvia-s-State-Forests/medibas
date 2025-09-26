import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumCopyIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumCopyIcon({ width = 24, height = 24, color = "gray8" }: MediumCopyIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="m17.618 2.804 2.719 2.946A2.5 2.5 0 0 1 21 7.445V16.5a2.5 2.5 0 0 1-2.5 2.5H17v.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 19.5v-12A2.5 2.5 0 0 1 5.5 5H7v-.5A2.5 2.5 0 0 1 9.5 2h6.281a2.5 2.5 0 0 1 1.837.804ZM7 16.5V7H5.5a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V19H9.5A2.5 2.5 0 0 1 7 16.5Zm12 0a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5h6.281a.5.5 0 0 1 .367.16l2.72 2.946a.5.5 0 0 1 .132.34V16.5Z"
            />
        </Svg>
    );
}
