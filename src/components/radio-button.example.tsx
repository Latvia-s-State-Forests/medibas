import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { RadioButton } from "~/components/radio-button";
import { theme } from "~/theme";

export function RadioButtonExampleScreen() {
    const insets = useSafeAreaInsets();
    const [checked, setChecked] = React.useState(false);

    function ignore() {
        // do nothing
    }

    function toggle() {
        setChecked((checked) => !checked);
    }

    return (
        <View style={styles.container}>
            <Header title="Radio Button" />
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
                <RadioButton label="Radio Button" checked={false} onPress={ignore} />
                <RadioButton label="Radio Button (disabled)" checked={false} onPress={ignore} disabled />
                <RadioButton label="Radio Button (checked)" checked={true} onPress={ignore} />
                <RadioButton label="Radio Button (checked and disabled)" checked={true} onPress={ignore} disabled />
                <RadioButton label="Radio Button (dynamic)" checked={checked} onPress={toggle} />
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
