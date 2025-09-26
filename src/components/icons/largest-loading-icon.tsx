import * as React from "react";
import Svg, { Path } from "react-native-svg";

type LargestLoadingIconProps = {
    width?: number;
    height?: number;
};

export function LargestLoadingIcon({ width = 96, height = 96 }: LargestLoadingIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 96 96">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48 92c24.3 0 44-19.7 44-44S72.3 4 48 4 4 23.7 4 48s19.7 44 44 44Zm0-4c22.091 0 40-17.909 40-40S70.091 8 48 8 8 25.909 8 48s17.909 40 40 40Z"
                fill="#77844F"
                fillOpacity=".5"
            />
            <Path d="M47.998 4a44 44 0 0 1 32.075 74.12l-2.887-2.71A40.04 40.04 0 0 0 47.998 7.96V4Z" fill="#77844F" />
        </Svg>
    );
}
