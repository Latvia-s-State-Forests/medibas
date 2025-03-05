import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Permit } from "~/types/permits";

export function usePermitsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<Permit[]>(queryKeys.permits, () => api.getPermits(), {
        initialData: userStorage.getPermits(),
        onSuccess: (permits) => {
            logger.log("Permits loaded");
            userStorage.setPermits(permits);
        },
        onError: (error) => {
            logger.error("Failed to load permits", error);
        },
        enabled,
    });
}
