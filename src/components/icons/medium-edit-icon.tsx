import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumEditIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumEditIcon({ width = 24, height = 24, color = "gray8" }: MediumEditIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                d="M16.0929 3.29289C16.4834 2.90237 17.1166 2.90237 17.5071 3.29289L20.7071 6.49289C21.0976 6.88342 21.0976 7.51658 20.7071 7.90711L7.90711 20.7071C7.71957 20.8946 7.46522 21 7.2 21H4C3.44772 21 3 20.5523 3 20V16.8C3 16.5348 3.10536 16.2804 3.29289 16.0929L16.0929 3.29289ZM20 19C20.5523 19 21 19.4477 21 20C21 20.5128 20.614 20.9355 20.1166 20.9933L20 21H12C11.4477 21 11 20.5523 11 20C11 19.4872 11.386 19.0645 11.8834 19.0067L12 19H20ZM14.6 7.614L5 17.214V19H6.784L16.385 9.399L14.6 7.614ZM16.8 5.415L16.014 6.2L17.799 7.985L18.585 7.2L16.8 5.415Z"
            />
        </Svg>
    );
}
