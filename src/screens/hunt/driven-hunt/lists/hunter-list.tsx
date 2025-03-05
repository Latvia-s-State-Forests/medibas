import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { usePermissions } from "~/hooks/use-permissions";
import { Hunt, HuntEventStatus } from "~/types/hunts";
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

    const hunters = React.useMemo(() => {
        const hunters: string[] = [];

        for (const hunter of hunt.hunters) {
            hunters.push(showHunterCardNumbers ? hunter.fullName + " " + hunter.huntersCardNumber : hunter.fullName);
        }

        for (const guestHunter of hunt.guestHunters) {
            hunters.push(
                showHunterCardNumbers
                    ? guestHunter.fullName + " " + guestHunter.guestHuntersCardNumber
                    : guestHunter.fullName
            );
        }

        hunters.sort((a, b) => a.localeCompare(b));

        return hunters;
    }, [hunt.hunters, hunt.guestHunters, showHunterCardNumbers]);

    if (hunters.length > 0) {
        return (
            <View>
                <List title={t("hunt.drivenHunt.detailScreen.hunters")} items={hunters} />
            </View>
        );
    }
    return null;
}
