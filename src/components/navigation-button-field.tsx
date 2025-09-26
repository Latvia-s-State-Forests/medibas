import * as React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationButton } from "~/components/navigation-button";
import { ReadOnlyField } from "~/components/read-only-field";

type NavigationButtonFieldProps = {
    label: string;
    value: string;
    latitude: number;
    longitude: number;
    locationLabel: string;
    hideNavigationButton?: boolean;
};

export function NavigationButtonField({
    label,
    value,
    latitude,
    longitude,
    locationLabel,
    hideNavigationButton = false,
}: NavigationButtonFieldProps) {
    return (
        <View style={styles.navigation}>
            <ReadOnlyField style={styles.navigationField} label={label} value={value} />
            {hideNavigationButton ? null : (
                <NavigationButton latitude={latitude} longitude={longitude} locationLabel={locationLabel} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    navigation: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    navigationField: {
        flex: 1,
    },
});
