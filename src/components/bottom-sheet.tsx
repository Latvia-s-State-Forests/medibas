import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import Animated, { FadeInLeft, FadeOutLeft, Layout, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "~/theme";
import { IconButton } from "./icon-button";
import { Text } from "./text";

type BottomSheetProps = {
    visible: boolean;
    title?: string;
    description?: string;
    onClose: () => void;
    children: React.ReactNode;
    onBackButtonPress: () => void;
    showBackButton?: boolean;
};

export function BottomSheet(props: BottomSheetProps) {
    const insets = useSafeAreaInsets();
    const headerPaddingLeft = { paddingLeft: props.showBackButton ? 6 : 16 };
    const navigation = useNavigation();
    React.useEffect(() => {
        function backAction() {
            const isFocused = navigation.isFocused();
            if (props.visible && isFocused) {
                if (props.showBackButton) {
                    props.onBackButtonPress();
                } else {
                    props.onClose();
                }
                return true;
            } else {
                return false;
            }
        }

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [navigation, props, props.onBackButtonPress, props.onClose, props.showBackButton]);

    if (!props.visible) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
            ]}
            entering={SlideInDown}
            exiting={SlideOutDown}
            layout={Layout}
        >
            <View style={[styles.header, headerPaddingLeft]}>
                {props.showBackButton && (
                    <Animated.View entering={FadeInLeft} exiting={FadeOutLeft}>
                        <IconButton name="chevronLeft" color="white" onPress={props.onBackButtonPress} />
                    </Animated.View>
                )}
                <Animated.View layout={Layout}>
                    <Text weight="bold" color="white">
                        {props.title}
                    </Text>
                </Animated.View>
                <IconButton name="close" color="white" onPress={props.onClose} />
            </View>
            {props.children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "50%",
        backgroundColor: theme.color.background,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
        overflow: "hidden",
    },
    header: {
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
        flexDirection: "row",
        paddingRight: 6,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.color.green,
    },
});
