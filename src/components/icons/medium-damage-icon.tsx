import * as React from "react";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumDamageIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumDamageIcon({ width = 24, height = 24, color = "gray8" }: MediumDamageIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <G clipPath="url(#a)">
                <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.34 1.524a1 1 0 0 1 .916.571l3.021 6.365.743-1.669a1 1 0 0 1 1.81-.034l2.51 5.102a1 1 0 0 1 1.7-.014l3.854 6.094a1 1 0 0 1-.677 1.52l-7.108 1.215a1 1 0 0 1-1.127-1.272l-5.47 1.548a1 1 0 0 1-1.186-1.369l.74-1.663-6.752 2.008a1 1 0 0 1-1.198-1.365l3.255-7.309-1.826-.813a1 1 0 0 1 .813-1.827l1.826.813L8.44 2.117a1 1 0 0 1 .901-.593ZM6.592 11.18a1 1 0 0 0 .025-.055L9.38 4.917l3.022 6.365a1 1 0 0 0 1.817-.022l.758-1.704 2.505 5.092a1 1 0 0 0 1.81-.034l.055-.121L21.4 17.74l-3.788.647.054-.12a1 1 0 0 0-1.186-1.37l-5.46 1.546.759-1.703a1 1 0 0 0-1.292-1.333L3.827 17.39l2.765-6.21Z"
                />
            </G>
            <Defs>
                <ClipPath id="a">
                    <Path d="M0 0h24v24H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
}
