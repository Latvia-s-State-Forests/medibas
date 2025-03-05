import * as React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { theme } from "~/theme";

type RoundActionButtonProps = {
    handleAction: () => void;
    iconName: MediumIconName;
    closeButtonInsets?: boolean;
};

export function RoundActionButton({ handleAction, iconName, closeButtonInsets = false }: RoundActionButtonProps) {
    const insets = useSafeAreaInsets();

    return (
        <TouchableOpacity
            onPress={handleAction}
            activeOpacity={0.5}
            style={[
                styles.button,
                Platform.OS === "ios" &&
                    closeButtonInsets && {
                        top: insets.top + 16,
                        right: insets.right + 16,
                    },
            ]}
        >
            <MediumIcon color="white" name={iconName} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        backgroundColor: theme.color.gray8,
        padding: 12,
        borderRadius: 24,
        right: 16,
        top: 16,
        opacity: 0.8,
        zIndex: 99,
    },
});
