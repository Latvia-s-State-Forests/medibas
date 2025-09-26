import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type MediumChevronRightIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function MediumChevronRightIcon({ width = 24, height = 24, color = "gray8" }: MediumChevronRightIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 20C7 19.744 7.098 19.488 7.293 19.293L14.586 12L7.293 4.70697C7.20016 4.61413 7.12651 4.5039 7.07626 4.3826C7.02602 4.26129 7.00015 4.13127 7.00015 3.99997C7.00015 3.86867 7.02602 3.73865 7.07626 3.61735C7.12651 3.49604 7.20016 3.38582 7.293 3.29297C7.38585 3.20013 7.49607 3.12648 7.61738 3.07623C7.73868 3.02598 7.8687 3.00012 8 3.00012C8.1313 3.00012 8.26132 3.02598 8.38263 3.07623C8.50394 3.12648 8.61416 3.20013 8.707 3.29297L16.707 11.293C16.7999 11.3858 16.8737 11.496 16.924 11.6173C16.9743 11.7386 17.0002 11.8686 17.0002 12C17.0002 12.1313 16.9743 12.2613 16.924 12.3827C16.8737 12.504 16.7999 12.6142 16.707 12.707L8.707 20.707C8.56734 20.8473 8.38914 20.9429 8.19502 20.9818C8.00091 21.0206 7.79963 21.0009 7.61673 20.9251C7.43383 20.8494 7.27756 20.721 7.16776 20.5563C7.05795 20.3916 6.99957 20.1979 7 20Z"
            />
        </Svg>
    );
}
