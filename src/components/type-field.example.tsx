import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { TypeField } from "~/components/type-field";
import { theme } from "~/theme";

export function TypeFieldExampleScreen() {
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState<string>("value1");

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Type Field" />
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
                <TypeField
                    label="Type (dynamic)"
                    options={[
                        { label: "Label", value: "value1", iconName: "tag", badgeCount: 1 },
                        { label: "Label", value: "value2", iconName: "tag", badgeCount: 1 },
                        { label: "Label", value: "value3", iconName: "tag", badgeCount: 1 },
                    ]}
                    value={value}
                    onChange={setValue}
                />
                <Spacer size={20} />
                <TypeField
                    label="Observations type"
                    options={[
                        { label: "Directly observed animals", value: "value1", iconName: "animals", badgeCount: 2 },
                        {
                            label: "Signs of presence",
                            value: "value2",
                            iconName: "signsOfPresence",
                        },
                        { label: "Dead", value: "value3", iconName: "deadAnimals", badgeCount: 1 },
                    ]}
                    value={""}
                    onChange={ignore}
                />
                <Spacer size={20} />
                <TypeField
                    label="Observations type (with badge)"
                    options={[
                        { label: "Directly observed animals", value: "value1", iconName: "animals", badgeCount: 1 },
                        {
                            label: "Signs of presence",
                            value: "value2",
                            iconName: "signsOfPresence",
                            badgeCount: 1,
                        },
                        { label: "Dead", value: "value3", iconName: "deadAnimals", badgeCount: 1 },
                    ]}
                    value={"value1"}
                    onChange={ignore}
                />
                <Spacer size={16} />
                <TypeField
                    label="Damages type"
                    options={[
                        { label: "Agricultural land (AL)", value: "value1", iconName: "land" },
                        {
                            label: "Forest",
                            value: "value2",
                            iconName: "forest",
                        },
                        { label: "Infrastructure", value: "value3", iconName: "infrastructure" },
                    ]}
                    value=""
                    onChange={ignore}
                />
                <Spacer size={20} />
                <TypeField
                    label="Agricultural land type"
                    options={[
                        { label: "Cropping", value: "value1", iconName: "cropping" },
                        { label: "Livestock", value: "value2", iconName: "livestock" },
                        { label: "Other", value: "value3", iconName: "other" },
                    ]}
                    value={""}
                    onChange={ignore}
                />
                <Spacer size={16} />
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
