import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MediumIcon } from "~/components/icon";
import { IconButton } from "~/components/icon-button";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

type HeaderProps = {
    title: string;
    showBackButton?: boolean;
    onBackButtonPress?: () => void;
    showCloseButton?: boolean;
    showEditButton?: boolean;
    onEditButtonPress?: () => void;
    onCloseButtonPress?: () => void;
    showTopInset?: boolean;
};

export function Header(props: HeaderProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const { title, showBackButton = true, showCloseButton, showEditButton, showTopInset = true } = props;

    const [isPressed, setIsPressed] = React.useState(false);

    function onBackButtonPress() {
        if (props.onBackButtonPress) {
            props.onBackButtonPress();
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }

    function onCloseButtonPress() {
        if (!props.onCloseButtonPress) {
            return;
        }
        props.onCloseButtonPress();
    }

    function onEditButtonPress() {
        if (!props.onEditButtonPress) {
            return;
        }
        props.onEditButtonPress();
    }

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: showTopInset ? insets.top : undefined,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
            ]}
        >
            <View style={styles.innerContainer}>
                <Spacer horizontal size={showBackButton ? 8 : 20} />
                {showBackButton && (
                    <>
                        <IconButton onPress={onBackButtonPress} color="white" name="arrowLeft" />
                        <Spacer horizontal size={6} />
                    </>
                )}
                <Text style={styles.titleText} size={18} weight="bold" numberOfLines={1}>
                    {title}
                </Text>
                {showEditButton ? (
                    <>
                        <Spacer horizontal size={6} />
                        <Pressable
                            onPressIn={() => setIsPressed(true)}
                            onPressOut={() => setIsPressed(false)}
                            onPress={onEditButtonPress}
                            style={[styles.editButton, isPressed ? styles.pressed : null]}
                        >
                            <Text style={styles.editText} weight="bold" size={18}>
                                {t("general.edit")}
                            </Text>
                            <Spacer horizontal size={16} />
                            <MediumIcon color="white" name="edit" />
                        </Pressable>
                        <Spacer horizontal size={8} />
                    </>
                ) : (
                    <Spacer horizontal size={showCloseButton ? 6 : 20} />
                )}
                {showCloseButton && (
                    <>
                        <IconButton onPress={onCloseButtonPress} color="white" name="close" />
                        <Spacer horizontal size={8} />
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.color.green,
    },
    innerContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
    },
    titleText: {
        flex: 1,
        color: theme.color.white,
        lineHeight: 24,
    },
    editButton: {
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    pressed: {
        opacity: 0.5,
    },
    editText: {
        color: theme.color.white,
        lineHeight: 24,
    },
});
