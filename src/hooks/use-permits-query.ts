import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Permit } from "~/types/permits";

export function usePermitsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<Permit[]>({
        queryKey: queryKeys.permits,
        queryFn: async () => {
            try {
                const permits = await api.getPermits();
                logger.log("Permits loaded");
                userStorage.setPermits(permits);
                return permits;
            } catch (error) {
                logger.error("Failed to load permits", error);
                throw error;
            }
        },
        initialData: () => userStorage.getPermits(),
        enabled,
    });
}
