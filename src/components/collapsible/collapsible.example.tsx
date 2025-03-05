import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Collapsible } from "~/components/collapsible/collapsible";
import { ObservationsCollapsible } from "~/components/collapsible/observations-collapsible";
import { Header } from "~/components/header";
import { SegmentedControl } from "~/components/segmented-control";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function CollapsibleExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Collapsible" />
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
                <Text>Collapsible</Text>
                <Spacer size={16} />
                <Collapsible title="Collapsible">
                    <ExampleContent />
                </Collapsible>

                <Collapsible title="Collapsible with badge" badgeCount={1}>
                    <ExampleContent />
                </Collapsible>

                <Collapsible
                    badgeCount={12}
                    lastInList
                    title="Collapsible with badge and a long title that should span multiple lines"
                >
                    <ExampleContent />
                </Collapsible>

                <Spacer size={40} />
                <Text>Observations Collapsible</Text>
                <Spacer size={16} />
                <ObservationsCollapsible onDeletePress={ignore} title="Observations collapsible">
                    <ExampleContent />
                </ObservationsCollapsible>

                <ObservationsCollapsible
                    onDeletePress={ignore}
                    lastInList
                    title="Observations collapsible with a long title that should span multiple lines"
                >
                    <ExampleContent />
                </ObservationsCollapsible>
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

function ExampleContent() {
    const [gender, setGender] = React.useState("1");
    return (
        <SegmentedControl
            label="Gender"
            options={[
                { label: "Male", value: "1" },
                { label: "Female", value: "2" },
                { label: "Unspecified", value: "3" },
            ]}
            value={gender}
            onChange={setGender}
        />
    );
}
