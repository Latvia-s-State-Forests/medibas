import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { usePermissions } from "~/hooks/use-permissions";
import { Hunt, HuntEventStatus } from "~/types/hunts";
import { getHunters } from "~/utils/get-hunters";
import { List } from "./list";

type HunterListProps = {
    hunt: Hunt;
};

export function HunterList({ hunt }: HunterListProps) {
    const { t } = useTranslation();
    const permissions = usePermissions();
    const hasPermissionToManageDrivenHunt = permissions.manageDrivenHunt(hunt.huntManagerPersonId);
    const isHuntConcluded = hunt.huntEventStatusId === HuntEventStatus.Concluded;
    const showHunterCardNumbers = hasPermissionToManageDrivenHunt && !isHuntConcluded;

    const hunters = React.useMemo(() => getHunters(hunt, showHunterCardNumbers), [hunt, showHunterCardNumbers]);

    if (hunters.length > 0) {
        return (
            <View>
                <List title={t("hunt.drivenHunt.detailScreen.hunters")} items={hunters} />
            </View>
        );
    }
    return null;
}
