import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function ButtonExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="Button" />
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
                <Text>Default button</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" disabled />
                <Spacer size={16} />

                <Text>Default button with icon</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" icon="settings" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" icon="settings" disabled />
                <Spacer size={16} />

                <Text>Danger button</Text>
                <Spacer size={8} />
                <Button onPress={ignore} variant="danger" title="Label" />
                <Spacer size={8} />
                <Button onPress={ignore} variant="danger" title="Label" disabled />
                <Spacer size={16} />

                <Text>Danger button with icon</Text>
                <Spacer size={8} />
                <Button onPress={ignore} variant="danger" title="Label" icon="settings" />
                <Spacer size={8} />
                <Button onPress={ignore} variant="danger" title="Label" icon="settings" disabled />
                <Spacer size={16} />

                <Text>Secondary (outlined) button</Text>
                <Spacer size={8} />
                <Button variant="secondary-outlined" onPress={ignore} title="Label" />
                <Spacer size={8} />
                <Button variant="secondary-outlined" onPress={ignore} title="Label" disabled />
                <Spacer size={16} />

                <Text>Secondary (outlined) button with icon</Text>
                <Spacer size={8} />
                <Button variant="secondary-outlined" icon="settings" onPress={ignore} title="Label" />
                <Spacer size={8} />
                <Button variant="secondary-outlined" icon="settings" onPress={ignore} title="Label" disabled />
                <Spacer size={16} />

                <Text>Secondary (dark) button</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-dark" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-dark" disabled />
                <Spacer size={16} />

                <Text>Secondary (dark) button with icon</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-dark" icon="settings" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-dark" icon="settings" disabled />
                <Spacer size={16} />

                <Text>Secondary (light) button</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-light" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-light" disabled />
                <Spacer size={16} />

                <Text>Secondary (light) button with icon</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-light" icon="settings" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="secondary-light" icon="settings" disabled />
                <Spacer size={16} />

                <Text>Link button</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="link" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="link" disabled />
                <Spacer size={16} />

                <Text>Link button with icon</Text>
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="link" icon="settings" />
                <Spacer size={8} />
                <Button onPress={ignore} title="Label" variant="link" icon="settings" disabled />
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
