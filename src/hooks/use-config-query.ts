import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Config } from "~/types/config";

export function useConfigQuery() {
    const userStorage = useUserStorage();

    return useQuery<Config>(queryKeys.config, () => api.getConfig(), {
        initialData: userStorage.getConfig(),
        onSuccess: (config) => {
            logger.log("Config loaded", config);
            userStorage.setConfig(config);
        },
        onError: (error) => {
            logger.error("Failed to load config", error);
        },
    });
}
