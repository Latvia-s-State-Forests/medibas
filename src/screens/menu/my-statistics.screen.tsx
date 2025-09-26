import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { MediumIcon } from "~/components/icon";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { theme } from "~/theme";

export function MyStatisticsScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <>
            <View style={styles.container}>
                <Header title={t("statistics.myStatistics")} />
                <ScrollView
                    contentContainerStyle={[
                        {
                            paddingRight: insets.right + 16,
                            paddingLeft: insets.left + 16,
                            paddingBottom: insets.bottom + 24,
                        },
                    ]}
                >
                    <View style={styles.margin}>
                        <PressableListItem
                            onPress={() => {
                                navigation.navigate("SpeciesStatisticsScreen");
                            }}
                            label={t("statistics.huntedAnimals")}
                            rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                            leftContent={<MediumIcon name="moose" />}
                        />
                        <PressableListItem
                            onPress={() => {
                                navigation.navigate("IndividualHuntStatisticsScreen");
                            }}
                            label={t("statistics.individualHunts")}
                            rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                            leftContent={<MediumIcon name="huntTarget" />}
                        />
                        <PressableListItem
                            onPress={() => {
                                navigation.navigate("DrivenHuntStatisticsScreen");
                            }}
                            label={t("statistics.drivenHunts")}
                            rightContent={<MediumIcon name="chevronRight" color="gray5" />}
                            leftContent={<MediumIcon name="hound" />}
                        />
                    </View>
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    margin: {
        marginHorizontal: -16,
    },
});
