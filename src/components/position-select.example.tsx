import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { theme } from "~/theme";
import { PositionSelect } from "./map/position-select";
import { Spacer } from "./spacer";
import { Text } from "./text";

export function PositionSelectExampleScreen() {
    const insets = useSafeAreaInsets();
    const [selectedPosition, setSelectedPosition] = React.useState<GeoJSON.Position | null>(null);
    const [selectSecondPosition, setSelectedSecondPosition] = React.useState<GeoJSON.Position | null>([
        25.17301313472615, 56.958195067711245,
    ]);

    function onSelectPosition(position: GeoJSON.Position) {
        setSelectedPosition(position);
    }

    function onSelectSecondPosition(position: GeoJSON.Position) {
        setSelectedSecondPosition(position);
    }

    return (
        <View style={styles.container}>
            <Header title="Position Select" />
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
                <Text>Select position</Text>
                <Spacer size={8} />
                <View style={styles.map}>
                    <PositionSelect onMark={onSelectPosition} position={selectedPosition} />
                </View>
                <Spacer size={16} />
                <Text>Position selected</Text>
                <Spacer size={8} />
                <View style={styles.map}>
                    <PositionSelect onMark={onSelectSecondPosition} position={selectSecondPosition} />
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
    map: {
        backgroundColor: theme.color.gray3,
        borderRadius: 8,
        overflow: "hidden",
    },
});
