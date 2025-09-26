import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { DrivenHuntStatisticsItem } from "~/types/statistics";
import { List } from "../hunt/driven-hunt/lists/list";

type HunterListStatisticsProps = {
    hunt: DrivenHuntStatisticsItem;
};

export function HunterListStatistics({ hunt }: HunterListStatisticsProps) {
    const { t } = useTranslation();

    const hunters = React.useMemo(() => {
        const huntersList: string[] = [];

        for (const hunter of hunt.hunters) {
            huntersList.push(hunter.fullName);
        }

        for (const guestHunter of hunt.guestHunters) {
            huntersList.push(guestHunter.fullName);
        }

        huntersList.sort((a, b) => a.localeCompare(b));
        return huntersList;
    }, [hunt.hunters, hunt.guestHunters]);

    if (hunters.length > 0) {
        return (
            <View>
                <List title={t("hunt.drivenHunt.detailScreen.hunters")} items={hunters} />
            </View>
        );
    }
    return null;
}
