import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumBrowseIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumBrowseIcon({ width = 24, height = 24, color = "gray8" }: MediumBrowseIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path d="M5.001 17.947C5.013 17.947 5.083 18 5.203 18H18.798C18.923 18 18.994 17.944 19.006 17.923L19 9.066L18.999 9.067C18.986 9.067 18.919 9.018 18.804 9.018H12.801C12.6506 9.01814 12.5021 8.9842 12.3666 8.91873C12.2312 8.85327 12.1123 8.75797 12.019 8.64L9.918 6H5.204C5.09 6 5.022 6.046 5 6.07V17.947H5.001ZM18.798 20H5.203C3.988 20 3 19.08 3 17.947V6.052C3 4.922 3.988 4 5.204 4H10.4C10.705 4 10.993 4.14 11.183 4.377L13.283 7.018H18.804C20.015 7.018 21 7.938 21 9.066V17.951C21 19.081 20.012 20.001 18.798 20.001V20Z" />
        </Svg>
    );
}
