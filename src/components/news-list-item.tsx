import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MediumIcon } from "~/components/icon";
import { ReadOnlyField } from "~/components/read-only-field";

type NewsListItemProps = {
    label: string;
    value: string;
    pressable?: boolean;
    onPress: () => void;
};

export function NewsListItem(props: NewsListItemProps) {
    return (
        <Pressable
            onPress={props.onPress}
            disabled={!props.pressable}
            style={({ pressed }) => [styles.navigation, pressed ? styles.pressed : null]}
        >
            <View style={styles.content}>
                <ReadOnlyField label={props.label} value={props.value} />
            </View>
            {props.pressable ? <MediumIcon name="chevronRight" color="gray5" /> : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    navigation: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    pressed: {
        opacity: 0.75,
    },
    content: {
        flex: 1,
    },
});
