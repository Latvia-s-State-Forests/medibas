import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { SmallIcon } from "~/components/icon";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function ReadOnlyFieldExampleScreen() {
    const insets = useSafeAreaInsets();
    const valueWithLink = "This is a value with a link https://www.google.com";
    const valueWithMultipleLinks =
        "This is a value with multiple links separated by comma https://www.lvmgeo.lv, https://www.google.com";
    const valueWithLinksSeparatedByWhitespace =
        "This is a value with multiple links separated by whitespace https://www.lvmgeo.lv https://www.google.com";

    return (
        <View style={styles.container}>
            <Header title="Read Only Field" />
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
                <ReadOnlyField label="Read Only Field" value="Value" />
                <Spacer size={16} />
                <ReadOnlyField
                    label="Read Only Field (with icon)"
                    value="Value"
                    icon={<SmallIcon name="valid" color="success" />}
                />
                <Spacer size={16} />
                <ReadOnlyField
                    label="Read Only Field (with icon)"
                    value="Value"
                    icon={<SmallIcon name="notValid" color="error" />}
                />
                <Spacer size={16} />
                <ReadOnlyField label="Read Only Field (with link)" value={valueWithLink} />
                <Spacer size={16} />
                <ReadOnlyField
                    label="Read Only Field (with multiple links separated by comma)"
                    value={valueWithMultipleLinks}
                />
                <Spacer size={16} />
                <ReadOnlyField
                    label="Read Only Field (with multiple links separated by whitespace)"
                    value={valueWithLinksSeparatedByWhitespace}
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
