import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumSaveIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumSaveIcon({ width = 24, height = 24, color = "gray8" }: MediumSaveIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path d="M21 19.002A2 2 0 0 1 19 21H5a2 2 0 0 1-2-1.998v-4.99a1 1 0 1 1 2 0v4.99L19 19v-4.989a1 1 0 1 1 2 0v4.991Zm-3.806-8.886a1 1 0 0 1 0 1.415l-3.78 3.772a2.006 2.006 0 0 1-2.827 0l-3.78-3.772a1.003 1.003 0 0 1-.002-1.415 1 1 0 0 1 1.414-.001L11 12.889v-8.89a1 1 0 0 1 2 0v8.89l2.78-2.774a1 1 0 0 1 1.414 0Z" />
        </Svg>
    );
}
