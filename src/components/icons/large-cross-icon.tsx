import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type LargeCrossIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function LargeCrossIcon({ width = 32, height = 32, color = "gray8" }: LargeCrossIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 32 32" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25.8788 4.29286C26.2693 3.90241 26.9024 3.90236 27.2929 4.29286C27.6833 4.68336 27.6833 5.31641 27.2929 5.70692L17.4139 15.5858L27.7069 25.8788C28.0974 26.2693 28.0974 26.9024 27.7069 27.2929C27.3164 27.6833 26.6834 27.6833 26.2929 27.2929L15.9999 16.9999L5.70692 27.2929C5.31641 27.6833 4.68336 27.6833 4.29286 27.2929C3.90236 26.9024 3.90241 26.2693 4.29286 25.8788L14.5858 15.5858L4.70692 5.70692C4.31649 5.31641 4.31649 4.68336 4.70692 4.29286C5.09742 3.90236 5.73045 3.90241 6.12098 4.29286L15.9999 14.1718L25.8788 4.29286Z"
            />
        </Svg>
    );
}
