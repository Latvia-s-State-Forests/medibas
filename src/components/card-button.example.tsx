import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardButton } from "~/components/card-button";
import { Header } from "~/components/header";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { theme } from "~/theme";

export function CardButtonExampleScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [actives, setActives] = React.useState({
        active: false,
        active2: false,
    });

    function ignore() {
        // do nothing
    }

    function toggle(key: keyof typeof actives) {
        setActives((actives) => ({ ...actives, [key]: !actives[key] }));
    }

    return (
        <View style={styles.container}>
            <Header title="Square Icon Button" />
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
                <Text>Card Button with radius small</Text>
                <Spacer size={16} />
                <CardButton radius="small" active={false} onPress={ignore} label={t("mtl.permits")} iconName="tag" />
                <Spacer size={8} />
                <Text>Dynamic</Text>
                <Spacer size={8} />
                <CardButton
                    radius="small"
                    onPress={() => toggle("active")}
                    active={actives.active}
                    label={t("mtl.permits")}
                    iconName="tag"
                />
                <Spacer size={8} />
                <Text>Disabled</Text>
                <Spacer size={8} />
                <CardButton
                    radius="small"
                    onPress={ignore}
                    active={false}
                    label={t("mtl.permits")}
                    iconName="tag"
                    disabled
                />

                <Spacer size={24} />
                <Text>Card Button with radius medium</Text>
                <Spacer size={16} />
                <CardButton onPress={ignore} active={false} label={t("mtl.permits")} iconName="tag" />
                <Spacer size={8} />
                <Text>Dynamic</Text>
                <Spacer size={8} />
                <CardButton
                    onPress={() => toggle("active2")}
                    active={actives.active2}
                    label={t("mtl.permits")}
                    iconName="tag"
                />
                <Spacer size={8} />
                <Text>Disabled</Text>
                <Spacer size={8} />
                <CardButton onPress={ignore} active={false} label={t("mtl.permits")} iconName="tag" disabled />
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
