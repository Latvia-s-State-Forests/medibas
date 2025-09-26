import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumLockIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumLockIcon({ width = 24, height = 24, color = "gray8" }: MediumLockIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 7a3 3 0 1 1 6 0v3H9a1 1 0 0 0 0-.018V7Zm-2 3a1 1 0 0 1 0-.018V7a5 5 0 1 1 10 0v3h.625A2.375 2.375 0 0 1 20 12.375v7.25A2.375 2.375 0 0 1 17.625 22H6.375A2.375 2.375 0 0 1 4 19.625v-7.25A2.375 2.375 0 0 1 6.375 10H7Zm-1 2.375c0-.207.168-.375.375-.375h11.25c.207 0 .375.168.375.375v7.25a.375.375 0 0 1-.375.375H6.375A.375.375 0 0 1 6 19.625v-7.25Z"
            />
        </Svg>
    );
}
