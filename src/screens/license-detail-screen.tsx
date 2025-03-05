import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Text } from "~/components/text";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";

type LicenseDetailScreenProps = NativeStackScreenProps<RootNavigatorParams, "LicenseDetailScreen">;

export function LicenseDetailScreen({ route }: LicenseDetailScreenProps) {
    const insets = useSafeAreaInsets();
    return (
        <View style={styles.container}>
            <Header title={route.params.dependency} />
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <Text weight="bold">{route.params.dependency}</Text>
                <Text style={styles.license}>{route.params.license}</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    content: {
        paddingTop: 24,
    },
    license: {
        marginTop: 24,
    },
});
