import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type LargestLockIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function LargestLockIcon({ width = 96, height = 96, color = "gray4" }: LargestLockIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 96 96" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48 92C72.3 92 92 72.3 92 48C92 23.7 72.3 4 48 4C23.7 4 4 23.7 4 48C4 72.3 23.7 92 48 92ZM48 88C70.091 88 88 70.091 88 48C88 25.909 70.091 8 48 8C25.909 8 8 25.909 8 48C8 70.091 25.909 88 48 88Z"
            />
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M42.8334 41.1667C42.8334 38.3131 45.1459 36 48 36C50.8539 36 53.1667 38.3106 53.1667 41.1667V45H42.8334V41.1667ZM39.8334 45.0039V41.1667C39.8334 36.6565 43.4888 33 48 33C52.5099 33 56.1667 36.6528 56.1667 41.1667V45.0039C58.0508 45.0924 59.5 46.6741 59.5 48.5455V59.4545C59.5 61.3807 57.9646 63 56 63H40C38.0354 63 36.5 61.3807 36.5 59.4545V48.5455C36.5 46.6741 37.9493 45.0924 39.8334 45.0039ZM54.6667 48H41.3334H40C39.7555 48 39.5 48.2123 39.5 48.5455V59.4545C39.5 59.7877 39.7555 60 40 60H56C56.2445 60 56.5 59.7877 56.5 59.4545V48.5455C56.5 48.2123 56.2445 48 56 48H54.6667Z"
            />
        </Svg>
    );
}
