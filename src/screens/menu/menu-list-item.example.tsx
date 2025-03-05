import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";
import { MenuListItem } from "./menu-list-item";

export function MenuListItemExampleScreen() {
    const insets = useSafeAreaInsets();

    function ignore() {
        // do nothing
    }

    return (
        <View style={styles.container}>
            <Header title="List" />
            <ScrollView contentContainerStyle={[{ paddingBottom: insets.bottom + 24 }]}>
                <MenuListItem onPress={ignore} icon="user" title="Lietotāja profils" />
                <MenuListItem onPress={ignore} count={3} icon="register" title="Iesniegtie vienumi" />
                <MenuListItem onPress={ignore} icon="settings" title="Iestatījumi" />
                <MenuListItem onPress={ignore} icon="info" title="Par lietotni" />
                <Spacer size={20} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
});
