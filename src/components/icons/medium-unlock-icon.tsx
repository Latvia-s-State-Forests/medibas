import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumUnlockIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumUnlockIcon({ width = 24, height = 24, color = "gray8" }: MediumUnlockIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M9 7a3 3 0 1 1 6 0 1 1 0 1 0 2 0A5 5 0 1 0 7 7v3h-.625A2.375 2.375 0 0 0 4 12.375v7.25A2.375 2.375 0 0 0 6.375 22h11.25A2.375 2.375 0 0 0 20 19.625v-7.25A2.375 2.375 0 0 0 17.625 10H9V7Zm-3 5.375c0-.207.168-.375.375-.375h11.25c.207 0 .375.168.375.375v7.25a.375.375 0 0 1-.375.375H6.375A.375.375 0 0 1 6 19.625v-7.25Z"
                clipRule="evenodd"
            />
        </Svg>
    );
}
