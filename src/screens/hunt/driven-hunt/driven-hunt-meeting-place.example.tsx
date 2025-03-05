import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { theme } from "~/theme";
import { DrivenHuntMeetingPlace } from "./driven-hunt-meeting-place";

export function DrivenHuntMeetingPlaceExampleScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <Header title="Driven Hunt Meeting Place" />
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
                <DrivenHuntMeetingPlace latitude={56.936432971683445} longitude={27.345833969824536} />
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
