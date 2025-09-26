import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Infrastructure } from "~/types/infrastructure";

export function useInfrastructureQuery(enabled: boolean = false) {
    const userStorage = useUserStorage();

    return useQuery<{ infrastructure: Infrastructure[]; fetched: string }>({
        queryKey: queryKeys.infrastructure,
        queryFn: async () => {
            try {
                const infrastructure = await api.getInfrastructure();
                const fetched = new Date().toISOString();
                logger.log("Infrastructure loaded");
                userStorage.setInfrastructure(infrastructure, fetched);
                return { infrastructure, fetched };
            } catch (error) {
                logger.error("Failed to load infrastructure", error);
                throw error;
            }
        },
        initialData: () => userStorage.getInfrastructure(),
        enabled,
    });
}
