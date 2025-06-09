import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Infrastructure } from "~/types/infrastructure";

export function useInfrastructureQuery(enabled: boolean = false) {
    const userStorage = useUserStorage();

    return useQuery<{ infrastructure: Infrastructure[]; fetched: string }>(
        queryKeys.infrastructure,
        async () => {
            const infrastructure = await api.getInfrastructure();
            const fetched = new Date().toISOString();
            return { infrastructure, fetched };
        },
        {
            initialData: userStorage.getInfrastructure(),
            onSuccess: (data) => {
                logger.log("Infrastructure loaded");
                userStorage.setInfrastructure(data.infrastructure, data.fetched);
            },
            onError: (error) => {
                logger.error("Failed to load infrastructure", error);
            },
            enabled,
        }
    );
}
