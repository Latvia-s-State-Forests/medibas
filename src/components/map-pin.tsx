import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";
import MapMarker from "~/assets/icons/other/map-pin.svg";
import { LargeIcon, LargeIconName } from "~/components/icon";
import { Color, theme } from "~/theme";

type MapPinIconProps = SvgProps & {
    color?: Color;
};

function MapPinIcon(props: MapPinIconProps) {
    const { color = "gray8", ...svgProps } = props;
    const Icon = MapMarker;
    const fillColor = theme.color[color as keyof typeof theme.color];
    return <Icon {...svgProps} fill={fillColor} />;
}

type MapPinProps = SvgProps & {
    appearance?: "default" | "active";
    color?: Color;
    iconName: LargeIconName;
    onPress: () => void;
};

export function MapPin({ appearance = "default", iconName, onPress }: MapPinProps) {
    return (
        <Pressable onPress={onPress} style={styles.mapPin}>
            <MapPinIcon style={styles.shadow} color={appearance === "default" ? "teal" : "orange"} />
            {Platform.OS === "android" ? <View style={[styles.shadowCircleAndroid, styles.shadow]}></View> : null}
            <View style={styles.circle}>
                <LargeIcon name={iconName} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    mapPin: {
        alignItems: "center",
        position: "relative",
    },
    shadow: {
        shadowColor: theme.color.gray8,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                shadowOpacity: 0.25,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    shadowCircleAndroid: {
        backgroundColor: theme.color.white,
        width: 48,
        height: 48,
        borderRadius: 24,
        position: "absolute",
        top: 0,
        zIndex: -1,
    },
    circle: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.color.white,
        top: 4,
        alignItems: "center",
        justifyContent: "center",
    },
});
