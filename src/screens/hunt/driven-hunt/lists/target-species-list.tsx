import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { DEFAULT_APP_LANGUAGE, getAppLanguage } from "~/i18n";
import { Hunt } from "~/types/hunts";
import { List } from "./list";

type TargetSpeciesListProps = {
    hunt: Hunt;
};

export function TargetSpeciesList({ hunt }: TargetSpeciesListProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();

    const targetSpecies = React.useMemo(() => {
        const language = getAppLanguage();

        const speciesById = new Map<number, string>();
        for (const species of classifiers.animalSpecies.options) {
            speciesById.set(
                species.id,
                species.description[language] ?? species.description[DEFAULT_APP_LANGUAGE] ?? "??"
            );
        }

        const permitTypesById = new Map<number, string>();
        for (const permitType of classifiers.permitTypes.options) {
            permitTypesById.set(
                permitType.id,
                permitType.description[language] ?? permitType.description[DEFAULT_APP_LANGUAGE] ?? "??"
            );
        }

        const result: string[] = [];
        for (const targetSpecies of hunt.targetSpecies) {
            if (targetSpecies.permitTypeId) {
                const permitType = permitTypesById.get(targetSpecies.permitTypeId);
                if (permitType) {
                    result.push(permitType);
                }
            } else {
                const species = speciesById.get(targetSpecies.speciesId);
                if (species) {
                    result.push(species);
                }
            }
        }
        result.sort((a, b) => a.localeCompare(b));
        return result;
    }, [hunt.targetSpecies, classifiers]);

    if (!hunt.hasTargetSpecies) {
        return (
            <ReadOnlyField
                label={t("hunt.drivenHunt.detailScreen.targetSpecies")}
                value={t("hunt.drivenHunt.detailScreen.targetSpeciesAll")}
            />
        );
    }
    if (targetSpecies.length > 0) {
        return (
            <View>
                <List title={t("hunt.drivenHunt.detailScreen.targetSpecies")} items={targetSpecies} />
            </View>
        );
    }
    return null;
}
