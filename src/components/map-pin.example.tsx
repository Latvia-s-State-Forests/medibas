import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { LargeIconName } from "~/components/icon";
import { MapPin } from "~/components/map-pin";
import { theme } from "~/theme";

export function MapPinExampleScreen() {
    const insets = useSafeAreaInsets();
    const [activePin, setActivePin] = React.useState<string | null>("birds");

    function handlePressIn(name: string) {
        setActivePin(activePin === name ? null : name);
    }

    const iconNames: LargeIconName[] = [
        "birds",
        "beaver",
        "badger",
        "damage",
        "binoculars",
        "signsOfPresence",
        "blackGrouse",
        "deadAnimals",
        "boar",
        "deer",
        "ferret",
        "fox",
        "hare",
        "hazelGrouse",
        "lynx",
        "marten",
        "moose",
        "pheasant",
        "polecat",
        "racoon",
        "roe",
        "westernCapercaillie",
        "wolf",
    ];

    return (
        <View style={styles.container}>
            <Header title="Map Pin" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <View style={styles.pinContainer}>
                    {iconNames.map((iconName) => (
                        <MapPin
                            key={iconName}
                            iconName={iconName}
                            onPress={() => handlePressIn(iconName)}
                            appearance={activePin === iconName ? "active" : "default"}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingTop: 24,
    },
    pinContainer: {
        flexWrap: "wrap",
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
    },
});
