import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { ImageButton } from "~/components/image-button";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function ImageButtonExampleScreen() {
    const insets = useSafeAreaInsets();
    const [isChecked, setIsChecked] = React.useState(false);

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Image Button" />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 16,
                        paddingRight: insets.right + 16,
                    },
                ]}
            >
                <View style={styles.content}>
                    <Text>Image button</Text>
                    <Spacer size={8} />
                    <ImageButton
                        onPress={ignore}
                        label="Label"
                        checked={false}
                        imageName={require("../assets/images/services/damages.jpg")}
                    />
                    <Spacer size={16} />
                    <Text>Checked image button</Text>
                    <Spacer size={8} />
                    <ImageButton
                        onPress={ignore}
                        label="Label"
                        checked={true}
                        imageName={require("../assets/images/services/basemap.jpg")}
                    />
                    <Spacer size={16} />
                    <Text>Dynamic image button</Text>
                    <Spacer size={8} />
                    <ImageButton
                        label="Label"
                        onPress={() => setIsChecked((isChecked) => !isChecked)}
                        checked={isChecked}
                        imageName={require("../assets/images/services/basemap.jpg")}
                    />
                </View>
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
        paddingTop: 16,
    },
    content: {
        alignItems: "flex-start",
    },
});
