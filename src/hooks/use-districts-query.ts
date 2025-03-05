import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { District } from "~/types/districts";

export function useDistrictsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<District[]>(queryKeys.districts, () => api.getDistricts(), {
        initialData: userStorage.getDistricts(),
        onSuccess: (districts) => {
            logger.log("Districts loaded");
            userStorage.setDistricts(districts);
        },
        onError: (error) => {
            logger.error("Failed to load districts", error);
        },
        enabled,
    });
}
