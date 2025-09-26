import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { HuntedAnimal } from "~/types/hunted-animals";

export function useHuntedAnimalsQuery(enabled: boolean = false) {
    const userStorage = useUserStorage();

    return useQuery<HuntedAnimal[]>({
        queryKey: queryKeys.huntedAnimals,
        queryFn: async () => {
            try {
                const huntedAnimals = await api.getHuntedAnimals();
                logger.log("Hunted animals loaded");
                userStorage.setHuntedAnimals(huntedAnimals);
                return huntedAnimals;
            } catch (error) {
                logger.error("Failed to load hunted animals", error);
                throw error;
            }
        },
        initialData: () => userStorage.getHuntedAnimals(),
        enabled,
    });
}
