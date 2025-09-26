import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { Text } from "~/components/text";
import { useContracts } from "~/hooks/use-contracts";
import { useProfile } from "~/hooks/use-profile";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { useSpeciesContext } from "~/hooks/use-species";
import { useTotalPermits } from "~/hooks/use-total-permits";
import { useValidPermits } from "~/hooks/use-valid-permits";
import { queryClient, queryKeys } from "~/query-client";
import { PermitsCollapsible } from "~/screens/mtl/permits/permits-collapsible";
import { theme } from "~/theme";
import { StrapStatusId } from "~/types/permits";
import { formatLabel } from "~/utils/format-label";

export function PermitsScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const speciesContext = useSpeciesContext();
    const profile = useProfile();
    const [selectedDistrictId] = useSelectedDistrictId();
    const totalPermits = useTotalPermits();
    const validPermits = useValidPermits();
    const contracts = useContracts();

    // Whenever the screen is focused, refetch permits and contracts
    useFocusEffect(
        React.useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.permits });
                queryClient.invalidateQueries({ queryKey: queryKeys.contracts });
            });
        }, [])
    );

    const selectedDistrict = profile.memberships.find(
        (membership) => membership.huntingDistrictId === selectedDistrictId
    )?.huntingDistrict.descriptionLv;

    function onEdit(contractId: number, permitTypeId: number, title: string) {
        navigation.navigate("PermitDistributionScreen", { contractId, permitTypeId, title });
    }

    return (
        <View style={styles.container}>
            <Header title={t("mtl.permits")} />
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
                <View style={styles.district}>
                    <Text weight="bold" color="gray5" size={12}>
                        {`${t("mtl.district")}: ${selectedDistrict}`}
                    </Text>
                </View>
                {speciesContext.limitedSpecies.map(({ description, id, permitTypeId, subspecies }, index) => {
                    if (!subspecies) {
                        const totalCount = totalPermits.filter((permit) => permit.permitTypeId === permitTypeId).length;
                        const availableCount = validPermits.filter(
                            (permit) => permit.permitTypeId === permitTypeId
                        ).length;
                        const usedCount = totalPermits.filter(
                            (permit) =>
                                permit.permitTypeId === permitTypeId && permit.strapStatusId !== StrapStatusId.Unused
                        ).length;

                        const contract = contracts.find((contract) => {
                            const isMasterDistrictCurrentlySelected = contract.masterDistrictId === selectedDistrictId;
                            if (!isMasterDistrictCurrentlySelected) {
                                return false;
                            }

                            const isTrusteeInMasterDistrict = profile.memberships.some(
                                (membership) =>
                                    membership.huntingDistrictId === contract.masterDistrictId && membership.isTrustee
                            );
                            if (!isTrusteeInMasterDistrict) {
                                return false;
                            }

                            const isPermitTypeIdInContract = contract.permits.some(
                                (permit) => permit.permitTypeId === permitTypeId
                            );
                            if (!isPermitTypeIdInContract) {
                                return false;
                            }

                            return true;
                        });

                        return (
                            <PermitsCollapsible
                                onEdit={() => {
                                    if (contract) {
                                        onEdit(contract.id, permitTypeId, formatLabel(description));
                                    }
                                }}
                                key={`${id}-${permitTypeId}`}
                                title={formatLabel(description)}
                                availableCount={availableCount}
                                totalCount={totalCount}
                                usedCount={usedCount}
                                lastInList={index === speciesContext.limitedSpecies.length - 1}
                            />
                        );
                    }
                    return subspecies.map(({ permitTypeId, description }) => {
                        const totalCount = totalPermits.filter((permit) => permit.permitTypeId === permitTypeId).length;
                        const availableCount = validPermits.filter(
                            (permit) => permit.permitTypeId === permitTypeId
                        ).length;
                        const usedCount = totalPermits.filter(
                            (permit) =>
                                permit.permitTypeId === permitTypeId && permit.strapStatusId !== StrapStatusId.Unused
                        ).length;

                        const contract = contracts.find((contract) => {
                            const isMasterDistrictCurrentlySelected = contract.masterDistrictId === selectedDistrictId;
                            if (!isMasterDistrictCurrentlySelected) {
                                return false;
                            }

                            const isTrusteeInMasterDistrict = profile.memberships.some(
                                (membership) =>
                                    membership.huntingDistrictId === contract.masterDistrictId && membership.isTrustee
                            );
                            if (!isTrusteeInMasterDistrict) {
                                return false;
                            }

                            const isPermitTypeIdInContract = contract.permits.some(
                                (permit) => permit.permitTypeId === permitTypeId
                            );

                            if (!isPermitTypeIdInContract) {
                                return false;
                            }

                            return true;
                        });

                        return (
                            <PermitsCollapsible
                                onEdit={() => {
                                    if (contract) {
                                        onEdit(contract.id, permitTypeId, formatLabel(description));
                                    }
                                }}
                                key={`${id}-${permitTypeId}`}
                                title={formatLabel(description)}
                                availableCount={availableCount}
                                totalCount={totalCount}
                                hasContracts={contract !== undefined}
                                usedCount={usedCount}
                                lastInList={index === subspecies.length - 1}
                            />
                        );
                    });
                })}
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
        paddingBottom: 32,
    },
    district: {
        paddingTop: 21,
        paddingBottom: 19,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
    },
});
