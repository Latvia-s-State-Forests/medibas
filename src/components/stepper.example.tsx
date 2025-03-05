import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Stepper } from "~/components/stepper";
import { theme } from "~/theme";

export function StepperExampleScreen() {
    const insets = useSafeAreaInsets();

    const [value, setValue] = React.useState<number>(0);

    function ignore() {
        // do nothing
    }
    return (
        <View style={styles.container}>
            <Header title="Stepper" />
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
                <Stepper label="Stepper" value={value} onChange={setValue} />
                <Spacer size={16} />
                <Stepper value={0} onChange={ignore} label="Stepper (disabled)" disabled />
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
