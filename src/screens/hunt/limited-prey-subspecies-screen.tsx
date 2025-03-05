import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "~/components/header";
import { useSpeciesContext } from "~/hooks/use-species";
import { RegisterPreyLimitedList } from "~/screens/hunt/register-prey-limited-list";
import { theme } from "~/theme";
import { RootNavigatorParams } from "~/types/navigation";
import { formatLabel } from "~/utils/format-label";

type LimitedPreySubspeciesProps = NativeStackScreenProps<RootNavigatorParams, "LimitedPreySubspeciesScreen">;

export function LimitedPreySubspeciesScreen({ route }: LimitedPreySubspeciesProps) {
    const speciesContext = useSpeciesContext();
    const insets = useSafeAreaInsets();
    const { species, unlimited, activeHuntHunters } = route.params;

    const subspecies = unlimited
        ? speciesContext.limitedUnlimitedSpecies.find((limitedSpecies) => limitedSpecies.id === species.id)?.subspecies
        : speciesContext.limitedSpecies.find((limitedSpecies) => limitedSpecies.id === species.id)?.subspecies;

    return (
        <View style={styles.container}>
            <Header title={formatLabel(species?.description)} />
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
                <RegisterPreyLimitedList
                    activeHuntHunters={activeHuntHunters}
                    species={subspecies ?? []}
                    type="subspecies"
                    unlimited={unlimited}
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
        paddingTop: 16,
    },
});
