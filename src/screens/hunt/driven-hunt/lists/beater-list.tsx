import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Hunt } from "~/types/hunts";
import { List } from "./list";

type BeaterListProps = {
    hunt: Hunt;
};

export function BeaterList({ hunt }: BeaterListProps) {
    const { t } = useTranslation();

    const beaters = React.useMemo(() => {
        const beaters: string[] = [];

        for (const beater of hunt.beaters) {
            beaters.push(beater.fullName);
        }

        for (const guestBeater of hunt.guestBeaters) {
            beaters.push(guestBeater.fullName);
        }

        beaters.sort((a, b) => a.localeCompare(b));

        return beaters;
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
