import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { RadioButtonList } from "~/components/radio-button-list";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function HeaderExampleScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [value, setValue] = React.useState<string>("value2");

    function goBack() {
        navigation.goBack();
    }

    function openForm() {
        alert("Opens editable form");
    }

    return (
        <View style={styles.container}>
            {value === "value" && <Header title="Header" showBackButton={false} />}
            {value === "value2" && <Header title="Header" />}
            {value === "value3" && (
                <Header title="Header" showBackButton={false} showCloseButton onCloseButtonPress={goBack} />
            )}
            {value === "value4" && <Header title="Header" showCloseButton onCloseButtonPress={goBack} />}
            {value === "value5" && (
                <Header title="Header" showBackButton={false} showEditButton onEditButtonPress={openForm} />
            )}
            {value === "value6" && <Header title="Header" showEditButton onEditButtonPress={openForm} />}
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
                <RadioButtonList
                    label="Header"
                    onChange={setValue}
                    value={value}
                    options={[
                        { label: "Only title", value: "value" },
                        { label: "Title and back button", value: "value2" },
                        { label: "Title and close button", value: "value3" },
                        { label: "Title, back button and close button", value: "value4" },
                        { label: "Title, and edit button", value: "value5" },
                        { label: "Title, back button and edit button", value: "value6" },
                    ]}
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
