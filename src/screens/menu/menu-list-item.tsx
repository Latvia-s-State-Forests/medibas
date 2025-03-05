import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type MenuListItemProps = {
    icon: MediumIconName;
    title: string;
    count?: number;
    hasNews?: boolean;
    onPress: () => void;
};

export function MenuListItem(props: MenuListItemProps) {
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
            onPress={props.onPress}
            style={[styles.container, isPressed ? styles.pressed : null]}
        >
            <>
                <MediumIcon name={props.icon} />
                <Spacer size={16} horizontal />
            </>

            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {props.title}
            </Text>

            <View style={styles.rightContent}>
                {props.count ? (
                    <>
                        <BorderlessBadge
                            count={props.count}
                            variant={props.hasNews ? "news-notification" : "action-required"}
                        />
                        <Spacer horizontal size={10} />
                    </>
                ) : null}
                <MediumIcon name="chevronRight" color="gray5" />
            </View>
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
        paddingHorizontal: 16,
    },
    pressed: {
        opacity: 0.75,
    },
    title: {
        flex: 1,
    },
    rightContent: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
});
