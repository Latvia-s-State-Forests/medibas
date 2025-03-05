import { Text as NativeText, TextProps as NativeTextProps } from "react-native";
import { Color, FontFamily, FontSize, theme } from "~/theme";

type TextProps = NativeTextProps & {
    /**
     * Size of the text. Defaults to `16`.
     */
    size?: FontSize;

    /**
     * Weight of the text. Defaults to `regular`.
     */
    weight?: FontFamily;

    /**
     * Color of the text. Defaults to `gray800`.
     */
    color?: Color;
};

export function Text({ size = 16, weight = "regular", color = "gray8", style, ...props }: TextProps) {
    const textColor = theme.color[color];
    const fontSize = theme.fontSize[size];
    const fontFamily = theme.fontFamily[weight];

    return (
        <NativeText
            {...props}
            style={[
                {
                    color: textColor,
                    fontSize,
                    fontFamily,
                },
                style,
            ]}
        />
    );
}
