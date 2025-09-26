import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useClassifiers } from "~/hooks/use-classifiers";
import { DEFAULT_APP_LANGUAGE, getAppLanguage } from "~/i18n";
import { HuntedTypeId } from "~/types/classifiers";
import { Hunt } from "~/types/hunts";
import { DrivenHuntStatisticsItem, IndividualHuntStatisticsItem } from "~/types/statistics";
import { getFilteredHuntedSpecies } from "~/utils/get-filtered-hunted-species";
import { getSortedItems } from "~/utils/get-sorted-items";
import { List } from "./list";

type HuntedSpeciesListProps = {
    hunt: Hunt | IndividualHuntStatisticsItem | DrivenHuntStatisticsItem;
};

export function HuntedSpeciesList({ hunt }: HuntedSpeciesListProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();

    const getSpeciesMap = React.useCallback(() => {
        const language = getAppLanguage();
        return new Map(
            classifiers.animalSpecies.options.map((species) => [
                species.id,
                species.description[language] ?? species.description[DEFAULT_APP_LANGUAGE] ?? "??",
            ])
        );
    }, [classifiers]);

    const getFilteredSpecies = React.useCallback(
        (typeId?: HuntedTypeId | null) => {
            const speciesById = getSpeciesMap();
            return getFilteredHuntedSpecies(hunt.huntedAnimals, speciesById, typeId);
        },
        [hunt.huntedAnimals, getSpeciesMap]
    );

    const huntedSpecies = React.useMemo(() => {
        const hunted = getFilteredSpecies(HuntedTypeId.Hunted);
        const nonLimited = getFilteredSpecies(null);
        return getSortedItems([...hunted, ...nonLimited]);
    }, [getFilteredSpecies]);

    const injuredSpecies = React.useMemo(
        () => getSortedItems(getFilteredSpecies(HuntedTypeId.Injured)),
        [getFilteredSpecies]
    );

    return (
        <>
            {huntedSpecies.length > 0 && (
                <View>
                    <List title={t("hunt.drivenHunt.detailScreen.huntedSpecies")} items={huntedSpecies} />
                </View>
            )}
            {injuredSpecies.length > 0 && (
                <View>
                    <List title={t("hunt.drivenHunt.detailScreen.injuredSpecies")} items={injuredSpecies} />
                </View>
            )}
        </>
    );
}
