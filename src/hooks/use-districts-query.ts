import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { District } from "~/types/districts";

export function useDistrictsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<District[]>({
        queryKey: queryKeys.districts,
        queryFn: async () => {
            try {
                const districts = await api.getDistricts();
                logger.log("Districts loaded");
                userStorage.setDistricts(districts);
                return districts;
            } catch (error) {
                logger.error("Failed to load districts", error);
                throw error;
            }
        },
        initialData: () => userStorage.getDistricts(),
        enabled,
    });
}
