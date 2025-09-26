import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Collapsible } from "~/components/collapsible/collapsible";
import { Header } from "~/components/header";
import { useInjuredAnimalPermits } from "~/hooks/use-injured-animal-permits";
import { usePermissions } from "~/hooks/use-permissions";
import { useSpeciesContext } from "~/hooks/use-species";
import { queryClient, queryKeys } from "~/query-client";
import { RegisterPreyInjuredList } from "~/screens/hunt/register-prey-injured-list";
import { RegisterPreyLimitedList } from "~/screens/hunt/register-prey-limited-list";
import { RegisterPreyUnlimitedList } from "~/screens/hunt/register-prey-unlimited-list";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";

type RegisterPrayScreenProps = NativeStackScreenProps<RootNavigatorParams, "RegisterPreyScreen">;

export function RegisterPreyScreen({ route }: RegisterPrayScreenProps) {
    const { activeHuntHunters } = route.params;
    const { t } = useTranslation();
    const speciesContext = useSpeciesContext();
    const injuredAnimalPermits = useInjuredAnimalPermits();
    const insets = useSafeAreaInsets();
    const permissions = usePermissions();

    useFocusEffect(
        React.useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.profile });
                queryClient.invalidateQueries({ queryKey: queryKeys.permits });
            });
        }, [])
    );

    const showLimitedUnlimitedSpecies =
        permissions.createDistrictHuntReports && speciesContext.limitedUnlimitedSpecies.length > 0;

    return (
        <View style={styles.container}>
            <Header title={t("hunt.registerPrey")} />
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
                {permissions.createDistrictHuntReports && injuredAnimalPermits.length > 0 ? (
                    <Collapsible
                        defaultCollapsed={false}
                        title={t("hunt.injuredAnimals")}
                        badgeCount={injuredAnimalPermits.length}
                        badgeVariant="action-required"
                    >
                        <RegisterPreyInjuredList
                            activeHuntHunters={activeHuntHunters}
                            species={[...speciesContext.limitedSpecies, ...speciesContext.limitedUnlimitedSpecies]}
                        />
                    </Collapsible>
                ) : null}

                {permissions.createDistrictHuntReports ? (
                    <Collapsible defaultCollapsed={false} title={t("hunt.limitedSpecies")}>
                        <RegisterPreyLimitedList
                            activeHuntHunters={activeHuntHunters}
                            species={speciesContext.limitedSpecies}
                            type="species"
                        />
                    </Collapsible>
                ) : null}

                <Collapsible lastInList={true} defaultCollapsed={false} title={t("hunt.unlimitedSpecies")}>
                    {showLimitedUnlimitedSpecies && (
                        <RegisterPreyLimitedList
                            activeHuntHunters={activeHuntHunters}
                            species={speciesContext.limitedUnlimitedSpecies}
                            type="species"
                            unlimited
                        />
                    )}
                    <RegisterPreyUnlimitedList
                        species={speciesContext.unlimitedSpecies}
                        showTitle={showLimitedUnlimitedSpecies}
                    />
                </Collapsible>
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
        paddingTop: 16,
    },
});
