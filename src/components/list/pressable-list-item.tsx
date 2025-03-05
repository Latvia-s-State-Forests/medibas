import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type PressableListItemProps = {
    label: string;
    onPress: () => void;
    leftContent?: React.ReactNode;
    description?: string;
    rightContent?: React.ReactNode;
    background?: "transparent" | "white";
    fullWidth?: boolean;
    hasTopBorder?: boolean;
    spaceRight?: boolean;
    clickable?: boolean;
    disabled?: boolean;
};

export function PressableListItem({
    background = "transparent",
    label,
    onPress,
    leftContent,
    description,
    rightContent,
    fullWidth = false,
    hasTopBorder = false,
    spaceRight = false,
    clickable = true,
    disabled = false,
}: PressableListItemProps) {
    const [isPressed, setIsPressed] = React.useState(false);

    function onPressIn() {
        setIsPressed(true);
    }

    function onPressOut() {
        setIsPressed(false);
    }

    return (
        <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            style={[
                styles.container,
                hasTopBorder && styles.topBorder,
                background === "white" && styles.white,
                isPressed && clickable && (background === "white" ? styles.whitePressed : styles.transparentPressed),
                !fullWidth && styles.paddingHorizontal,
            ]}
            disabled={disabled}
        >
            {leftContent && (
                <>
                    <View style={styles.content}>{leftContent}</View>

                    <Spacer size={16} horizontal />
                </>
            )}
            <Text style={styles.label} color={disabled ? "gray4" : undefined} numberOfLines={1} ellipsizeMode="tail">
                {label}
            </Text>

            {description ? (
                <>
                    <Spacer size={16} horizontal />
                    <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail" size={12} color="gray4">
                        {description}
                    </Text>
                </>
            ) : null}

            {rightContent && (
                <>
                    <View style={styles.content}>{rightContent}</View>
                    <Spacer horizontal size={spaceRight ? 16 : 0} />
                </>
            )}
        </Pressable>
    );
}
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
    },
    topBorder: {
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
    },
    transparentPressed: {
        opacity: 0.75,
    },
    white: {
        backgroundColor: theme.color.white,
    },
    whitePressed: {
        backgroundColor: theme.color.gray1,
    },
    label: {
        flex: 1,
    },
    description: {
        textAlign: "right",
        maxWidth: "50%",
    },
    content: {
        justifyContent: "center",
        alignItems: "center",
    },
    paddingHorizontal: {
        paddingHorizontal: 16,
    },
});
