import React from "react";
import { useTranslation } from "react-i18next";
import { HuntPlace } from "~/types/hunts";

export function useGetHuntPlaceName() {
    const { t } = useTranslation();

    const getHuntPlaceName = React.useCallback(
        (placeId: HuntPlace | undefined, isTitle = false) => {
            if (placeId === undefined) {
                return "";
            }

            const HUNT_PLACE_ID: {
                [key in HuntPlace]: string;
            } = {
                [HuntPlace.InTheStation]: t("hunt.individualHunt.inTheStation"),
                [HuntPlace.WaterBody]: t("hunt.individualHunt.waterBody"),
                [HuntPlace.OutSideStation]: t("hunt.individualHunt.outSideStation"),
            };
            if (isTitle && placeId === HuntPlace.InTheStation) {
                return t("statistics.inTheStation");
            }

            return HUNT_PLACE_ID[placeId];
        },
        [t]
    );

    return getHuntPlaceName;
}
