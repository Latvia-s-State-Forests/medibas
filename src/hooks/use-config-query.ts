import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Config } from "~/types/config";

export function useConfigQuery() {
    const userStorage = useUserStorage();

    return useQuery<Config>({
        queryKey: queryKeys.config,
        queryFn: async () => {
            try {
                const config = await api.getConfig();
                logger.log("Config loaded", config);
                userStorage.setConfig(config);
                return config;
            } catch (error) {
                logger.error("Failed to load config", error);
                throw error;
            }
        },
        initialData: () => userStorage.getConfig(),
    });
}
