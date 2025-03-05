import * as React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Input } from "~/components/input";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function InputExampleScreen() {
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState("");
    const [valueMultiline, setValueMultiline] = React.useState("");

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Input" />
            <KeyboardAwareScrollView
                extraScrollHeight={20}
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
                <Spacer size={16} />
                <Input label="Empty input (disabled)" onChangeText={ignore} value="" editable={false} />
                <Spacer size={16} />

                <Input label="Input (with value)" onChangeText={ignore} value="Value" />
                <Spacer size={16} />
                <Input label="Input (with value, disabled)" onChangeText={ignore} value="Value" editable={false} />
                <Spacer size={16} />
                <Input
                    label="Input (Input with very long text to test if the long text truncates)"
                    onChangeText={ignore}
                    value=""
                />
                <Spacer size={16} />
                <Input
                    label="Input (Input with very longwordwithoutanyspacestotestifitbreaksthelayoutornotbreakthelayout)"
                    onChangeText={ignore}
                    value=""
                />
                <Spacer size={16} />
                <Input label="Input (dynamic - in one line)" onChangeText={setValue} value={value} />
                <Spacer size={16} />
                <Input
                    isMultiline={true}
                    label="Input (dynamic - span in multiple lines)"
                    onChangeText={setValueMultiline}
                    value={valueMultiline}
                />
                <Spacer size={16} />
                <Input
                    editable={false}
                    isMultiline={true}
                    label="Input (multiple lines - disabled)"
                    onChangeText={ignore}
                    value=""
                />
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
    },
});
