import * as React from "react";
import { useHuntActivities } from "~/components/hunt-activities-provider";
import { useUserStorage } from "~/machines/authentication-machine";
import { Hunt } from "~/types/hunts";
import { combineHuntsWithActivities } from "~/utils/combine-hunts-with-activities";

const HuntsContext = React.createContext<Hunt[] | null>(null);

type HuntsProviderProps = {
    hunts: Hunt[];
    children: React.ReactNode;
};

export function HuntsProvider(props: HuntsProviderProps) {
    const activities = useHuntActivities();
    const userStorage = useUserStorage();
    const latestHuntFetchDate = userStorage.getLatestHuntFetchDate();

    const hunts = React.useMemo(() => {
        return combineHuntsWithActivities(props.hunts, activities, latestHuntFetchDate);
    }, [props.hunts, activities, latestHuntFetchDate]);

    return <HuntsContext.Provider value={hunts}>{props.children}</HuntsContext.Provider>;
}

export function useHunts() {
    const hunts = React.useContext(HuntsContext);

    if (hunts === null) {
        throw new Error("HuntsContext not initialized");
    }

    return hunts;
}
