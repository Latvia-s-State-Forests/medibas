import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Classifiers } from "~/types/classifiers";

export function useClassifiersQuery() {
    const userStorage = useUserStorage();

    return useQuery<Classifiers>({
        queryKey: queryKeys.classifiers,
        queryFn: async () => {
            try {
                const classifiers = await api.getClassifiers();
                logger.log("Classifiers loaded");
                userStorage.setClassifiers(classifiers);
                return classifiers;
            } catch (error) {
                logger.error("Failed to load classifiers", error);
                throw error;
            }
        },
        initialData: () => userStorage.getClassifiers(),
    });
}
