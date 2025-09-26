import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { LargeIconName } from "~/components/icon";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useDistrictDamages } from "~/hooks/use-district-damages";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { DamageTypeId } from "~/types/classifiers";
import { DistrictDamage } from "~/types/district-damages";
import { RootNavigatorParams } from "~/types/navigation";
import { getCoordinates } from "~/utils/get-coordinates";
import { DistrictDamageListItem } from "./district-damages-list-item";

type DistrictDamagesListScreenProps = NativeStackScreenProps<RootNavigatorParams, "DistrictDamagesListScreen">;

export function DistrictDamagesListScreen(props: DistrictDamagesListScreenProps) {
    const classifiers = useClassifiers();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const profile = useProfile();
    const language = getAppLanguage();
    const districtId = props.route.params.districtId;
    const damagesPerDistrictId = useDistrictDamages();
    const damages = damagesPerDistrictId[districtId] ?? [];

    // Whenever the screen is focused, refetch damages
    useFocusEffect(
        React.useCallback(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.districtDamages });
        }, [])
    );

    function getDamageTitle(type: DamageTypeId): string {
        return (
            classifiers.damageTypes.options.find(({ id }) => id === type)?.description[language] ??
            t("damage.damageReports.UnknownType")
        );
    }

    const district = profile.memberships.find((membership) => membership.huntingDistrictId === districtId)
        ?.huntingDistrict.descriptionLv;

    type DamageTypeIcon = {
        [key: number]: LargeIconName;
    };

    const damageTypeIcon: DamageTypeIcon = {
        1: configuration.damage.typeIcons[DamageTypeId.AgriculturalLand],
        2: configuration.damage.typeIcons[DamageTypeId.Forest],
        3: configuration.damage.typeIcons[DamageTypeId.Infrastructure],
    };

    const sortedDamages = damages.sort((a: DistrictDamage, b: DistrictDamage) => {
        return new Date(b.vmdAcceptedOn).getTime() - new Date(a.vmdAcceptedOn).getTime();
    });

    const reportedDistrictDamagesCount = configuration.districtDamages.daysToKeepEntriesFor;

    return (
        <View style={styles.container}>
            <Header title={district ?? ""} />
            <FlatList
                data={sortedDamages}
                ListHeaderComponent={() => (
                    <Text style={styles.description}>
                        {sortedDamages.length > 0
                            ? t("damage.damagesReportsTitle.hasReports", {
                                  count: reportedDistrictDamagesCount,
                              })
                            : t("damage.damagesReportsTitle.noReports", {
                                  count: reportedDistrictDamagesCount,
                              })}
                    </Text>
                )}
                ListFooterComponent={() => <Spacer size={insets.bottom + 24} />}
                ItemSeparatorComponent={() => <Spacer size={8} />}
                renderItem={({ item: damage }) => (
                    <DistrictDamageListItem
                        key={`${damage.id}_${damage.damageTypeId}`}
                        iconName={damageTypeIcon[damage.damageTypeId] ?? "cross"}
                        type={getDamageTitle(damage.damageTypeId)}
                        onPress={() => navigation.navigate("DistrictDamagesDetailScreen", { detail: damage })}
                        time={damage.vmdAcceptedOn}
                        position={getCoordinates(damage)}
                    />
                )}
                keyExtractor={(damage) => damage.id.toString()}
                contentContainerStyle={{
                    paddingLeft: insets.left + 16,
                    paddingRight: insets.right + 16,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    description: {
        padding: 24,
        textAlign: "center",
    },
});
