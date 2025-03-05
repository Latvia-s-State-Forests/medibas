import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { DistrictDamagePosition } from "~/screens/damage/district-damage/district-damage-position";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { DistrictDamageFields } from "./district-damage-fields";

type DistrictDamagesDetailScreenProps = NativeStackScreenProps<RootNavigatorParams, "DistrictDamagesDetailScreen">;

export function DistrictDamagesDetailScreen(props: DistrictDamagesDetailScreenProps) {
    const damage = props.route.params.detail;
    const insets = useSafeAreaInsets();
    const classifiers = useClassifiers();
    const language = getAppLanguage();

    const title =
        getDescriptionForClassifierOption(classifiers.damageTypes.options, language, damage.damageTypeId) ?? "";

    return (
        <View style={styles.container}>
            <Header title={title} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <DistrictDamagePosition latitude={damage.locationY} longitude={damage.locationX} />

                <DistrictDamageFields damage={damage} />
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
        paddingVertical: 24,
        gap: 16,
    },
});
