import * as React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Input } from "~/components/input";
import { theme } from "~/theme";

export function InputExampleScreen() {
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState("");

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Input" />
            <KeyboardAwareScrollView
                bottomOffset={20}
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <Input label="Empty input" onChangeText={ignore} value="" />
                <Input label="Empty input (disabled)" onChangeText={ignore} value="" editable={false} />
                <Input label="Input (with value)" onChangeText={ignore} value="Value" />
                <Input label="Input (with value, disabled)" onChangeText={ignore} value="Value" editable={false} />
                <Input
                    label="Input (Input with very long text to test if the long text truncates)"
                    onChangeText={ignore}
                    value=""
                />
                <Input
                    label="Input (Input with very longwordwithoutanyspacestotestifitbreaksthelayoutornotbreakthelayout)"
                    onChangeText={ignore}
                    value=""
                />
                <Input label="Input (dynamic)" onChangeText={setValue} value={value} />
            </KeyboardAwareScrollView>
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
        gap: 16,
    },
});
