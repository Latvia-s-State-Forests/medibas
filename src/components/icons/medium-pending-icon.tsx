import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumPendingIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumPendingIcon({ width = 24, height = 24, color = "gray8" }: MediumPendingIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path d="M12 2C17.514 2 22 6.486 22 12C22 17.514 17.514 22 12 22C6.486 22 2 17.514 2 12C2 10.05 2.639 8.646 3.328 7.419C3.598 6.937 4.207 6.765 4.69 7.038C5.172 7.308 5.343 7.918 5.072 8.399C4.429 9.543 4 10.594 4 12C4 16.411 7.589 20 12 20C16.411 20 20 16.411 20 12C20 7.928 16.94 4.564 13 4.069V5.455C13 6.007 12.553 6.455 12 6.455C11.447 6.455 11 6.007 11 5.455V3C11 2.448 11.447 2 12 2ZM7.0505 9.0333C7.3325 8.5593 7.9455 8.4033 8.4215 8.6863L11.0455 10.2523C11.3315 10.0963 11.6525 10.0003 12.0005 10.0003C13.1055 10.0003 14.0005 10.8943 14.0005 12.0003C14.0005 13.1053 13.1055 14.0003 12.0005 14.0003C10.8945 14.0003 10.0005 13.1053 10.0005 12.0003C10.0005 11.9863 10.0035 11.9733 10.0035 11.9603L7.3965 10.4043C6.9225 10.1213 6.7675 9.5073 7.0505 9.0333Z" />
        </Svg>
    );
}
