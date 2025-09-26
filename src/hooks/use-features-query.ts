import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Features } from "~/types/features";

export function useFeaturesQuery() {
    const userStorage = useUserStorage();

    return useQuery<Features>({
        queryKey: queryKeys.features,
        queryFn: async () => {
            try {
                const features = await api.getFeatures();
                logger.log("Features loaded");
                userStorage.setFeatures(features);
                return features;
            } catch (error) {
                logger.error("Failed to load features", error);
                throw error;
            }
        },
        initialData: () => userStorage.getFeatures(),
    });
}
