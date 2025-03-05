import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Classifiers } from "~/types/classifiers";

export function useClassifiersQuery() {
    const userStorage = useUserStorage();

    return useQuery<Classifiers>(queryKeys.classifiers, () => api.getClassifiers(), {
        initialData: userStorage.getClassifiers(),
        onSuccess: (classifiers) => {
            logger.log("Classifiers loaded");
            userStorage.setClassifiers(classifiers);
        },
        onError: (error) => {
            logger.error("Failed to load classifiers", error);
        },
    });
}
