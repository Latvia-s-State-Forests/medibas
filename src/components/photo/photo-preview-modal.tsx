import * as React from "react";
import { Dimensions, Modal, Platform, Pressable, StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MediumIcon } from "~/components/icon";
import { theme } from "~/theme";

type PhotoPreviewModalProps = {
    photo: string;
    onClose: () => void;
};

export function PhotoPreviewModal(props: PhotoPreviewModalProps) {
    const insets = useSafeAreaInsets();

    const [isCloseButtonPressed, setIsCloseButtonPressed] = React.useState(false);

    function onCloseButtonPressIn() {
        setIsCloseButtonPressed(true);
    }

    function onCloseButtonPressOut() {
        setIsCloseButtonPressed(false);
    }

    function onCloseButtonPress() {
        props.onClose();
        setIsCloseButtonPressed(false);
        scale.value = 1;
        focalX.value = width / 2;
        focalY.value = height / 2;
    }

    const { width, height } = Dimensions.get("window");
    const scale = useSharedValue(1);
    const MAX_SCALE = 6;
    const focalX = useSharedValue(width / 2);
    const focalY = useSharedValue(height / 2);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);
    const savedScale = useSharedValue(1);

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onStart((e) => {
            if (scale.value === 1) {
                focalX.value = e.x;
                focalY.value = e.y;
                startX.value = e.x;
                startY.value = e.y;
                savedScale.value = MAX_SCALE;
                scale.value = withTiming(MAX_SCALE);
            } else {
                savedScale.value = 1;
                scale.value = withTiming(1);
            }
        });

    const panGesture = Gesture.Pan()
        .maxPointers(1)
        .onUpdate((e) => {
            if (scale.value === 3) {
                e.translationX = e.translationX / 2;
                e.translationY = e.translationY / 2;
            }

            if (scale.value > 3) {
                e.translationX = e.translationX / 3;
                e.translationY = e.translationY / 3;
            }

            if (-e.translationX + startX.value > 0 && -e.translationX < 0) {
                focalX.value = -e.translationX + startX.value;
            }

            if (-e.translationX + startX.value < width && -e.translationX > 0) {
                focalX.value = -e.translationX + startX.value;
            }

            if (-e.translationY + startY.value > 0 && -e.translationY < 0) {
                focalY.value = -e.translationY + startY.value;
            }

            if (-e.translationY + startY.value < height && -e.translationY > 0) {
                focalY.value = -e.translationY + startY.value;
            }
        })
        .onEnd(() => {
            startX.value = focalX.value;
            startY.value = focalY.value;
        });

    function clamp(value: number, lowestZoom: number, highestZoom: number) {
        "worklet";
        return Math.min(Math.max(lowestZoom, value), highestZoom);
    }

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            const clampedValue = clamp(event.scale * savedScale.value, 1, MAX_SCALE);

            scale.value = clampedValue;
            if (clampedValue > savedScale.value) {
                focalX.value = withTiming(event.focalX, {
                    duration: 400,
                    easing: Easing.bezier(0.04, 0.48, 0.65, 1.02),
                });
                focalY.value = withTiming(event.focalY, {
                    duration: 400,
                    easing: Easing.bezier(0.04, 0.48, 0.65, 1.02),
                });
            } else {
                focalX.value = withTiming(startX.value);
                focalY.value = withTiming(startY.value);
            }
        })
        .onEnd(() => {
            startX.value = withTiming(focalX.value);
            startY.value = withTiming(focalY.value);
            savedScale.value = withTiming(scale.value);
            cancelAnimation(focalX);
            cancelAnimation(focalY);
        });

    const animatedImageStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: focalX.value },
                { translateY: focalY.value },
                { translateX: -width / 2 },
                { translateY: -height / 2 },
                { scale: scale.value },
                { translateX: -focalX.value },
                { translateY: -focalY.value },
                { translateX: width / 2 },
                { translateY: height / 2 },
            ],
        };
    });

    return (
        <Modal visible onRequestClose={props.onClose}>
            <Pressable
                onPressIn={onCloseButtonPressIn}
                onPressOut={onCloseButtonPressOut}
                onPress={onCloseButtonPress}
                style={[
                    styles.button,
                    isCloseButtonPressed && styles.buttonPressed,
                    Platform.OS === "ios" && {
                        top: insets.top + 16,
                        right: insets.right + 16,
                    },
                ]}
            >
                <MediumIcon color="white" name="cross" />
            </Pressable>
            <GestureHandlerRootView style={styles.gestureHandlerView}>
                <GestureDetector gesture={Gesture.Race(panGesture, pinchGesture, doubleTapGesture)}>
                    <Animated.Image
                        source={{ uri: props.photo }}
                        style={[styles.image, styles.openImage, animatedImageStyle]}
                    />
                </GestureDetector>
            </GestureHandlerRootView>
        </Modal>
    );
}

export const styles = StyleSheet.create({
    gestureHandlerView: {
        flex: 1,
        backgroundColor: theme.color.gray9,
    },
    image: {
        flex: 1,
    },
    openImage: {
        resizeMode: "contain",
    },

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
    buttonPressed: {
        opacity: 0.5,
    },
});
