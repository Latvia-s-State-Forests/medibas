import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Features } from "~/types/features";

export function useFeaturesQuery() {
    const userStorage = useUserStorage();

    return useQuery<Features>(queryKeys.features, () => api.getFeatures(), {
        initialData: userStorage.getFeatures(),
        onSuccess: (features) => {
            logger.log("Features loaded");
            userStorage.setFeatures(features);
        },
        onError: (error) => {
            logger.error("Failed to load features", error);
        },
    });
}
