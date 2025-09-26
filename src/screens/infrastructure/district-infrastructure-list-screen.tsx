import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Header } from "~/components/header";
import {
    useDistrictInfrastructure,
    useInfrastructureChangesCount,
    usePendingInfrastructureChangesCount,
} from "~/components/infrastructure-provider";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { usePermissions } from "~/hooks/use-permissions";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { HuntingInfrastructureTypeId } from "~/types/classifiers";
import { Infrastructure } from "~/types/infrastructure";
import { RootNavigatorParams } from "~/types/navigation";
import { formatPosition } from "~/utils/format-position";
import { DistrictInfrastructureListItem } from "./district-infrastructure-list-item";

type DistrictInfrastructureListScreenProps = NativeStackScreenProps<
    RootNavigatorParams,
    "DistrictInfrastructureListScreen"
>;

export function DistrictInfrastructureListScreen(props: DistrictInfrastructureListScreenProps) {
    const districtId = props.route.params.districtId;
    const classifiers = useClassifiers();
    const infrastructureInDistrict = useDistrictInfrastructure(districtId);
    const navigation = useNavigation();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const profile = useProfile();
    const language = getAppLanguage();
    const permissions = usePermissions();

    const infrastructureChangesCount = useInfrastructureChangesCount();
    const pendingInfrastructureChangesCount = usePendingInfrastructureChangesCount();

    useFocusEffect(
        React.useCallback(() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.infrastructure });
        }, [])
    );

    function getInfrastructureTitle(type: HuntingInfrastructureTypeId): string {
        return (
            classifiers.huntingInfrastructureTypes.options.find(({ id }) => id === type)?.description[language] ?? ""
        );
    }

    const district = profile.memberships.find((membership) => membership.huntingDistrictId === districtId)
        ?.huntingDistrict.descriptionLv;

    const sortedDamages = infrastructureInDistrict?.sort((a: Infrastructure, b: Infrastructure) => {
        return new Date(b.createdOnDevice).getTime() - new Date(a.createdOnDevice).getTime();
    });

    return (
        <View style={styles.container}>
            <Header
                title={district ?? ""}
                showRegisterButton={infrastructureChangesCount > 0}
                onRegisterButtonPress={() => {
                    navigation.navigate("DistrictInfrastructureChangesListScreen");
                }}
                registerButtonBadgeCount={pendingInfrastructureChangesCount}
            />
            <FlatList
                data={sortedDamages}
                ListEmptyComponent={() => (
                    <>
                        <Spacer size={24} />
                        <Text style={styles.emptyMessage}>{t("mtl.infrastructure.emptyMessage")}</Text>
                    </>
                )}
                ListHeaderComponent={() =>
                    permissions.manageInfrastructure() ? (
                        <>
                            <View style={styles.addInfrastructureButton}>
                                <Button
                                    variant="secondary-dark"
                                    icon="plus"
                                    onPress={() =>
                                        navigation.navigate("DistrictInfrastructureFormScreen", {
                                            infrastructureToEdit: undefined,
                                            currentDistrictId: districtId,
                                        })
                                    }
                                    title={t("mtl.infrastructure.add")}
                                />
                            </View>
                            <Spacer size={sortedDamages?.length ? 16 : 0} />
                        </>
                    ) : (
                        <Spacer size={sortedDamages?.length ? 32 : 0} />
                    )
                }
                ListFooterComponent={() => <Spacer size={insets.bottom + 24} />}
                ItemSeparatorComponent={() => <Spacer size={8} />}
                renderItem={({ item: infrastructure }) => (
                    <DistrictInfrastructureListItem
                        key={`${infrastructure.id}_${infrastructure.typeId}`}
                        iconName={
                            configuration.huntingInfrastructure.typeIcons[
                                infrastructure.typeId as HuntingInfrastructureTypeId
                            ] ?? "cross"
                        }
                        type={getInfrastructureTitle(infrastructure.typeId)}
                        onPress={() =>
                            navigation.navigate("DistrictInfrastructureDetailScreen", {
                                detail: infrastructure,
                                title: getInfrastructureTitle(infrastructure.typeId),
                            })
                        }
                        createdDate={infrastructure.createdOnDevice}
                        changedDate={infrastructure.changedOnDevice}
                        position={formatPosition({
                            latitude: infrastructure.locationY,
                            longitude: infrastructure.locationX,
                        })}
                    />
                )}
                keyExtractor={(infrastructure) => infrastructure.guid}
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
    emptyMessage: {
        textAlign: "center",
    },
    addInfrastructureButton: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
        paddingBottom: 8,
    },
});
