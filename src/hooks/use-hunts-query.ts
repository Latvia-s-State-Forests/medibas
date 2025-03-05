import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Hunt } from "~/types/hunts";

export function useHuntsQuery(enabled: boolean = false) {
    const userStorage = useUserStorage();

    return useQuery<Hunt[]>(queryKeys.hunts, () => api.getHunts(), {
        initialData: userStorage.getHunts(),
        onSuccess: (hunts) => {
            logger.log("Hunts loaded");
            userStorage.setHunts(hunts);
            userStorage.setLatestHuntFetchDate(new Date().toISOString());
        },
        onError: (error) => {
            logger.error("Failed to load hunts", error);
        },
        enabled,
    });
}
