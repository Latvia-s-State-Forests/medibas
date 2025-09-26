import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { NewsListItem } from "~/components/news-list-item";
import { Spacer } from "~/components/spacer";
import { theme } from "~/theme";

export function NewsListItemExampleScreen() {
    const insets = useSafeAreaInsets();

    function onPress() {
        alert("News item with individual hunt pressed");
    }

    return (
        <View style={styles.container}>
            <Header title="News List Item" />
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
                <NewsListItem
                    label="2025-09-09 11:23"
                    value="Reģistrētas individuālās medības iecirknī: 2526-00147(Pēteris Laizāns)"
                    pressable={true}
                    onPress={onPress}
                />
                <Spacer size={24} />
                <NewsListItem
                    label="2025-09-09 11:23"
                    value="Reģistrētas individuālās medības iecirknī: 2526-00147(Pēteris Laizāns) Very long text to test wrapping and see how it looks in the UI for smaller devices."
                    pressable={true}
                    onPress={onPress}
                />
                <Spacer size={24} />
                <NewsListItem
                    label="2025-09-09 11:23 Very long label to test wrapping for smaller devices and see how it looks in the UI"
                    value="Reģistrētas individuālās medības iecirknī: 2526-00147(Pēteris Laizāns)."
                    pressable={true}
                    onPress={onPress}
                />
                <Spacer size={24} />
                <NewsListItem label="2025-09-09 14:39" value="Sākas jauna medību sezona" onPress={onPress} />
                <Spacer size={24} />
                <NewsListItem
                    label="2025-09-09 14:39"
                    value="Citas ziņas medniekiem bez medību saites"
                    onPress={onPress}
                />
                <Spacer size={24} />
                <NewsListItem
                    label="2025-09-08 16:45"
                    value="Reģistrētas dzinējmedības iecirknī: 2526-00147(Kārlis Zāle)"
                    onPress={onPress}
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
