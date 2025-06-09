import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { HuntLocationViewer } from "./hunt-location-viewer";

export function HuntLocationViewerExampleScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Header title="Hunt Location Viewer" />
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
                <Text>View location for individual hunt</Text>
                <Spacer size={8} />
                <HuntLocationViewer
                    huntType="individualHunt"
                    latitude={56.936432971683445}
                    longitude={27.345833969824536}
                />
                <Spacer size={16} />
                <Text>View location for driven hunt</Text>
                <Spacer size={8} />
                <HuntLocationViewer
                    huntType="drivenHunt"
                    latitude={56.936432971683445}
                    longitude={27.345833969824536}
                />
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
});
