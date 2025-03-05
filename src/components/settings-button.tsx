import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { MediumIcon } from "~/components/icon";
import { useNews } from "~/hooks/use-news";
import { theme } from "~/theme";
import { Badge } from "./badge";
import { useUnsyncedReportsCount } from "./reports-provider";

type SettingsButtonProps = {
    onPress?: () => void;
    disabled?: boolean;
};

export function SettingsButton(props: SettingsButtonProps) {
    const navigation = useNavigation();
    const [isPressed, setIsPressed] = React.useState(false);
    const unSyncedChangesCount = useUnsyncedReportsCount();
    const { unreadNewsCount } = useNews();
    const badgeCount = unSyncedChangesCount + unreadNewsCount;

    function onPress() {
        if (props.onPress) {
            props.onPress();
        }
        navigation.navigate("MenuScreen");
    }

    function handlePressIn() {
        setIsPressed(true);
    }

    function handlePressOut() {
        setIsPressed(false);
    }

    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, props.disabled && styles.disabled, isPressed && styles.buttonPressed]}
            disabled={props.disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <MediumIcon name="userSettings" color={isPressed ? "white" : "gray8"} />
            {badgeCount ? (
                <View style={styles.badge}>
                    <Badge count={badgeCount} variant="action-required" />
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        width: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowColor: theme.color.gray8,
                shadowRadius: 8,
                shadowOpacity: 0.16,
            },
            android: {
                elevation: 7,
            },
        }),
    },
    buttonPressed: {
        backgroundColor: theme.color.greenActive,
        borderColor: theme.color.greenActive,
    },
    disabled: {
        opacity: 0.5,
    },
    badge: {
        position: "absolute",
        top: -8,
        right: -8,
        justifyContent: "center",
        alignItems: "center",
    },
});
