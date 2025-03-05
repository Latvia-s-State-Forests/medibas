import * as React from "react";
import { Platform, Pressable, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent } from "react-native";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { Text } from "~/components/text";
import { theme, Color } from "~/theme";

type Variant = "primary" | "secondary-dark" | "secondary-light" | "secondary-outlined" | "link" | "danger";

type textColorType = {
    [key in Variant]: Color;
};
type ButtonProps = {
    title: string;
    onPress: () => void;
    variant?: Variant;
    icon?: MediumIconName;
    disabled?: boolean;
    onLayout?: (event: LayoutChangeEvent) => void;
    style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, onLayout, variant = "primary", icon, disabled = false, style }: ButtonProps) {
    const [isPressed, setIsPressed] = React.useState(false);
    const buttonBackground =
        (variant === "primary" ? styles.buttonPrimary : undefined) ||
        (variant === "danger" ? styles.buttonDanger : undefined) ||
        (variant === "secondary-outlined" ? styles.buttonSecondaryOutlined : undefined);

    const buttonPressedBackground =
        (variant === "primary" && styles.buttonPrimaryPressed) ||
        (variant === "danger" && styles.buttonDangerPressed) ||
        (variant === "secondary-outlined" && styles.buttonSecondaryOutlinedPressed) ||
        styles.buttonSecondaryPressed;

    const dangerButtonShadow = variant === "danger" && !isPressed && !disabled ? styles.buttonDangerShadow : undefined;

    const justifyContent =
        (icon && variant === "primary") || (icon && variant === "danger") || (icon && variant === "secondary-outlined")
            ? styles.justifyBetween
            : styles.justifyCenter;
    const textGap = icon && variant !== "primary" ? styles.textGap : undefined;
    const contentColor: textColorType = {
        primary: "white",
        "secondary-dark": "gray8",
        "secondary-light": "gray5",
        "secondary-outlined": "gray8",
        danger: "error",
        link: "teal",
    };

    function determineColor(variant: Variant, contentColor: textColorType) {
        return variant === "secondary-dark" ? "teal" : contentColor[variant];
    }

    function handlePressIn() {
        setIsPressed(() => true);
    }

    function handlePressOut() {
        setIsPressed(() => false);
    }
    return (
        <Pressable
            onLayout={onLayout}
            onPress={onPress}
            disabled={disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.button,
                justifyContent,
                buttonBackground,
                isPressed && buttonPressedBackground,
                disabled && styles.disabled,
                dangerButtonShadow,
                style,
            ]}
        >
            <Text
                size={18}
                weight="bold"
                color={contentColor[variant]}
                style={[textGap, icon ? styles.textLeft : styles.textCenter]}
            >
                {title}
            </Text>
            {icon && <MediumIcon name={icon} color={determineColor(variant, contentColor)} />}
        </Pressable>
    );
}

const buttonSecondaryOutlinedStyle = {
    borderWidth: 1,
    borderColor: theme.color.gray2,
};

const styles = StyleSheet.create({
    button: {
        padding: 16,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    buttonPrimary: {
        backgroundColor: theme.color.teal,
    },
    buttonPrimaryPressed: {
        backgroundColor: theme.color.tealPressed,
    },
    buttonDanger: {
        backgroundColor: theme.color.white,
        borderWidth: 1,
        borderColor: theme.color.gray2,
    },
    buttonDangerShadow: {
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowOpacity: 0.08,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
                shadowColor: theme.color.gray8,
            },
        }),
    },
    buttonDangerPressed: {
        backgroundColor: theme.color.gray2,
    },
    buttonSecondaryOutlined: {
        ...buttonSecondaryOutlinedStyle,
    },
    buttonSecondaryOutlinedPressed: {
        ...buttonSecondaryOutlinedStyle,
        backgroundColor: theme.color.gray2,
    },
    buttonSecondaryPressed: {
        opacity: 0.75,
    },
    disabled: {
        opacity: 0.5,
    },
    justifyBetween: {
        justifyContent: "space-between",
    },
    justifyCenter: {
        justifyContent: "center",
    },
    textGap: {
        marginRight: 16,
    },
    textLeft: {
        textAlign: "left",
    },
    textCenter: {
        textAlign: "center",
    },
});
