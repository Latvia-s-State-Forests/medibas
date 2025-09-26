import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DrivenHuntStatisticsItem } from "~/types/statistics";
import { List } from "../hunt/driven-hunt/lists/list";

type BeaterListStatisticsProps = {
    hunt: DrivenHuntStatisticsItem;
};

export function BeaterListStatistics({ hunt }: BeaterListStatisticsProps) {
    const { t } = useTranslation();

    const beaters = React.useMemo(() => {
        const beatersList: string[] = [];

        for (const beater of hunt.beaters) {
            beatersList.push(beater.fullName);
        }

        for (const guestBeater of hunt.guestBeaters) {
            beatersList.push(guestBeater.fullName);
        }

        beatersList.sort((a, b) => a.localeCompare(b));

        return beatersList;
    }, [hunt.beaters, hunt.guestBeaters]);

    if (beaters.length > 0) {
        return (
            <View>
                <List title={t("hunt.drivenHunt.detailScreen.beaters")} items={beaters} />
            </View>
        );
    }
    return null;
}
