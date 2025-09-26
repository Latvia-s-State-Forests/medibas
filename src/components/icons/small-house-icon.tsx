import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Color, theme } from "~/theme";

type SmallHouseIconProps = {
    width?: number;
    height?: number;
    color?: Color;
};

export function SmallHouseIcon({ width = 16, height = 16, color = "gray8" }: SmallHouseIconProps) {
    const fillColor = theme.color[color as keyof typeof theme.color];
    return (
        <Svg width={width} height={height} viewBox="0 0 16 16" fill={fillColor}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 12H10.5V9.50001C10.5 8.39701 9.603 7.50001 8.5 7.50001H7.5C6.397 7.50001 5.5 8.39701 5.5 9.50001V12H4V6.56601L8 4.16601L12 6.56601V12ZM7.5 12H8.5V9.50001H7.5V12ZM13.515 5.14301L8.515 2.14301C8.35958 2.04925 8.18151 1.99969 8 1.99969C7.81849 1.99969 7.64042 2.04925 7.485 2.14301L2.485 5.14301C2.33702 5.2318 2.21457 5.35741 2.12957 5.5076C2.04458 5.65779 1.99994 5.82743 2 6.00001V12.248C2 13.214 2.784 14 3.749 14H12.25C13.215 14 14 13.214 14 12.248V6.00001C14.0001 5.82743 13.9554 5.65779 13.8704 5.5076C13.7854 5.35741 13.663 5.2318 13.515 5.14301Z"
            />
        </Svg>
    );
}
