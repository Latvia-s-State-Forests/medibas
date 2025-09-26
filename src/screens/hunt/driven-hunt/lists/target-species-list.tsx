import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { Hunt } from "~/types/hunts";
import { formatTargetSpecies } from "~/utils/format-target-species";
import { List } from "./list";

type TargetSpeciesListProps = {
    hunt: Hunt;
};

export function TargetSpeciesList({ hunt }: TargetSpeciesListProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const appLanguage = getAppLanguage();

    const targetSpecies = React.useMemo(() => {
        return formatTargetSpecies(hunt.targetSpecies, classifiers, appLanguage);
    }, [hunt.targetSpecies, classifiers, appLanguage]);

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
