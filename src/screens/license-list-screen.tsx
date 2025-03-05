import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import licenses from "../../licenses.json";

export function LicenseListScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Header title={t("licenseList.title")} />
            <FlatList
                data={licenses}
                renderItem={({ item }) => {
                    return (
                        <ListItem
                            title={item.dependency}
                            onPress={() => {
                                navigation.navigate("LicenseDetailScreen", {
                                    dependency: item.dependency,
                                    license: item.license,
                                });
                            }}
                        />
                    );
                }}
                keyExtractor={(item) => item.dependency}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListFooterComponent={<View style={{ height: insets.bottom + 24 }} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    listItem: {
        paddingVertical: 16,
        backgroundColor: theme.color.white,
    },
    listItemPressed: {
        backgroundColor: theme.color.gray1,
    },
    separator: {
        height: 1,
        backgroundColor: theme.color.gray2,
    },
});

type ListItemProps = {
    title: string;
    onPress: () => void;
};

function ListItem(props: ListItemProps) {
    const insets = useSafeAreaInsets();
    const [isPressed, setIsPressed] = React.useState(false);

    function onPressIn() {
        setIsPressed(true);
    }

    function onPressOut() {
        setIsPressed(false);
    }

    return (
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={props.onPress}>
            <View
                style={[
                    styles.listItem,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                    },
                    isPressed ? styles.listItemPressed : undefined,
                ]}
            >
                <Text>{props.title}</Text>
            </View>
        </Pressable>
    );
}
