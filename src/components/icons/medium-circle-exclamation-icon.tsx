import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumCircleExclamationIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumCircleExclamationIcon({
    width = 24,
    height = 24,
    color = "gray8",
}: MediumCircleExclamationIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path d="M12 3C16.962 3 21 7.038 21 12C21 16.962 16.962 21 12 21C7.038 21 3 16.962 3 12C3 7.038 7.038 3 12 3ZM12 5C8.14 5 5 8.14 5 12C5 15.86 8.14 19 12 19C15.86 19 19 15.86 19 12C19 8.14 15.86 5 12 5ZM12 9.8C12.552 9.8 13 10.248 13 10.8V16C13 16.552 12.552 17 12 17C11.448 17 11 16.552 11 16V10.8C11 10.248 11.448 9.8 12 9.8ZM12 7C12.552 7 13 7.448 13 8C13 8.552 12.552 9 12 9C11.448 9 11 8.552 11 8C11 7.448 11.448 7 12 7Z" />
        </Svg>
    );
}
