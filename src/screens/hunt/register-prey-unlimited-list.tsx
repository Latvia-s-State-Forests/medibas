import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Text } from "~/components/text";
import { RegisterPreyListItem } from "~/screens/hunt/register-prey-list-item";
import { SpeciesId } from "~/types/classifiers";
import { UnlimitedSpecies } from "~/types/hunt";
import { formatLabel } from "~/utils/format-label";

type RegisterPreyUnlimitedListProps = {
    species: UnlimitedSpecies[];
    showTitle?: boolean;
};

export function RegisterPreyUnlimitedList({ species, showTitle }: RegisterPreyUnlimitedListProps) {
    const { t } = useTranslation();
    const navigation = useNavigation();

    return (
        <>
            {showTitle && (
                <View style={styles.container}>
                    <Text weight="bold" color="green" size={16}>
                        {t("hunt.other")}
                    </Text>
                </View>
            )}
            {species.map((species) => {
                return (
                    <RegisterPreyListItem
                        key={species.id}
                        type={formatLabel(species.description)}
                        iconName={species.icon}
                        term={species.id === SpeciesId.OtherMammals ? "" : species.term ?? t("hunt.unlimitedTerm")}
                        onPress={() => navigation.navigate("UnlimitedPreyScreen", { speciesId: String(species.id) })}
                    />
                );
            })}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 7,
        paddingBottom: 12,
    },
});
