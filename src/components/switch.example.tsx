import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Switch } from "~/components/switch";
import { theme } from "~/theme";

export function SwitchExampleScreen() {
    const insets = useSafeAreaInsets();

    const [value, setValue] = React.useState<boolean>(false);

    function ignore() {
        // do nothing
    }

    function handlePress() {
        setValue((value) => !value);
    }
    return (
        <View style={styles.container}>
            <Header title="Switch" />
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
                <Switch label="Switch" checked={false} onPress={ignore} />

                <Spacer size={16} />
                <Switch label="Switch (checked)" checked={true} onPress={ignore} />

                <Spacer size={16} />
                <Switch label="Switch (disabled)" checked={false} onPress={ignore} disabled />

                <Spacer size={16} />
                <Switch label="Switch (checked and disabled)" checked={true} onPress={ignore} disabled />

                <Spacer size={16} />
                <Switch label="Switch (dynamic)" checked={value} onPress={handlePress} />
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
