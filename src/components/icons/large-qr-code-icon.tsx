import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type LargeQrCodeIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function LargeQrCodeIcon({ width = 32, height = 32, color = "gray8" }: LargeQrCodeIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 32 32" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M13 5H5v8h8V5ZM5 3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"
                clipRule="evenodd"
            />
            <Path
                fillRule="evenodd"
                d="M8 7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H8Zm19-2h-8v8h8V5Zm-8-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-8Z"
                clipRule="evenodd"
            />
            <Path
                fillRule="evenodd"
                d="M22 7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2Zm-9 12H5v8h8v-8Zm-8-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H5Z"
                clipRule="evenodd"
            />
            <Path
                fillRule="evenodd"
                d="M8 21a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H8Zm14 0a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Zm-4-4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Zm8 0a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Zm0 8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Zm-8 0a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2Z"
                clipRule="evenodd"
            />
        </Svg>
    );
}
