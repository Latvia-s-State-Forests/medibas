import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Hunt } from "~/types/hunts";

export function useHuntsQuery(enabled: boolean = false) {
    const userStorage = useUserStorage();

    return useQuery<Hunt[]>({
        queryKey: queryKeys.hunts,
        queryFn: async () => {
            try {
                const { hunts, timing } = await api.getHunts();
                userStorage.setHunts(hunts);
                userStorage.setLastHuntsRequestTiming(timing);
                logger.log(`Hunts loaded in ${timing.duration}ms`);
                return hunts;
            } catch (error) {
                logger.error("Failed to load hunts", error);
                throw error;
            }
        },
        initialData: () => userStorage.getHunts(),
        enabled,
    });
}
