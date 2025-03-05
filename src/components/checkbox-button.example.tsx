import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckboxButton } from "~/components/checkbox-button";
import { FieldLabel } from "~/components/field-label";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function CheckboxButtonExampleScreen() {
    const insets = useSafeAreaInsets();
    const [checkbox, setCheckbox] = React.useState<"unchecked" | "indeterminate" | "checked">("unchecked");

    function ignore() {
        // do nothing
    }

    function toggle() {
        switch (checkbox) {
            case "unchecked":
                setCheckbox("indeterminate");
                break;
            case "indeterminate":
                setCheckbox("checked");
                break;
            case "checked":
                setCheckbox("unchecked");
                break;
        }
    }

    return (
        <View style={styles.container}>
            <Header title="Checkbox Button" />
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
                <FieldLabel label="Variant default" />
                <CheckboxButton label="Checkbox Button" state="unchecked" onPress={ignore} />
                <CheckboxButton label="Checkbox Button (disabled)" state="unchecked" onPress={ignore} disabled />
                <CheckboxButton label="Checkbox Button (checked)" state="checked" onPress={ignore} />
                <CheckboxButton label="Checkbox Button (indeterminate)" state="indeterminate" onPress={ignore} />
                <CheckboxButton
                    label="Checkbox Button (indeterminate and disabled)"
                    state="indeterminate"
                    disabled
                    onPress={ignore}
                />
                <CheckboxButton
                    label="Checkbox Button (checked and disabled)"
                    state="checked"
                    onPress={ignore}
                    disabled
                />
                <CheckboxButton label="Checkbox Button (dynamic)" state={checkbox} onPress={toggle} />
                <Spacer size={24} />

                <FieldLabel label="Variant teal" />
                <CheckboxButton variant="teal" label="Checkbox Button" state="unchecked" onPress={ignore} />
                <CheckboxButton
                    variant="teal"
                    label="Checkbox Button (disabled)"
                    state="unchecked"
                    onPress={ignore}
                    disabled
                />
                <CheckboxButton variant="teal" label="Checkbox Button (checked)" state="checked" onPress={ignore} />
                <CheckboxButton
                    variant="teal"
                    label="Checkbox Button (indeterminate)"
                    state="indeterminate"
                    onPress={ignore}
                />
                <CheckboxButton
                    variant="teal"
                    label="Checkbox Button (indeterminate and disabled)"
                    state="indeterminate"
                    disabled
                    onPress={ignore}
                />
                <CheckboxButton
                    variant="teal"
                    label="Checkbox Button (checked and disabled)"
                    state="checked"
                    onPress={ignore}
                    disabled
                />
                <CheckboxButton variant="teal" label="Checkbox Button (dynamic)" state={checkbox} onPress={toggle} />
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
