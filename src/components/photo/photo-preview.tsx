import * as React from "react";
import { Image, Pressable, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { MediumIcon } from "~/components/icon";
import { theme } from "~/theme";

type PhotoPreviewProps = {
    photo: string;
    onDelete: () => void;
    onOpenPreview: () => void;
};

export function PhotoPreview(props: PhotoPreviewProps) {
    const [isPressedTrash, setIsPressedTrash] = React.useState(false);

    function handlePressInTrash() {
        setIsPressedTrash(() => true);
    }

    function handlePressOutTrash() {
        setIsPressedTrash(() => false);
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={props.onOpenPreview}>
                <Image source={{ uri: props.photo }} style={styles.image} />
            </TouchableWithoutFeedback>
            <Pressable
                onPressIn={handlePressInTrash}
                onPressOut={handlePressOutTrash}
                onPress={props.onDelete}
                style={[styles.button, isPressedTrash && styles.buttonPressed]}
            >
                <MediumIcon color="white" name="trash" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        borderRadius: 8,
        width: "100%",
        height: 200,
        overflow: "hidden",
    },
    image: {
        flex: 1,
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
