import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Hunt } from "~/types/hunts";
import { getBeaters } from "~/utils/get-beaters";
import { List } from "./list";

type BeaterListProps = {
    hunt: Hunt;
};

export function BeaterList({ hunt }: BeaterListProps) {
    const { t } = useTranslation();

    const beaters = React.useMemo(() => getBeaters(hunt), [hunt]);

    if (beaters.length > 0) {
        return (
            <View>
                <List title={t("hunt.drivenHunt.detailScreen.beaters")} items={beaters} />
            </View>
        );
    }
    return null;
}
