import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { UnlimitedHuntedAnimal } from "~/types/unlimited-hunted-animals";

export function useUnlimitedHuntedAnimalsQuery(enabled: boolean = false) {
    const userStorage = useUserStorage();

    return useQuery<UnlimitedHuntedAnimal[]>({
        queryKey: queryKeys.unlimitedHuntedAnimals,
        queryFn: async () => {
            try {
                const unlimitedHuntedAnimals = await api.getUnlimitedHuntedAnimals();
                logger.log("Unlimited hunted animals loaded");
                userStorage.setUnlimitedHuntedAnimals(unlimitedHuntedAnimals);
                return unlimitedHuntedAnimals;
            } catch (error) {
                logger.error("Failed to load unlimited hunted animals", error);
                throw error;
            }
        },
        initialData: () => userStorage.getUnlimitedHuntedAnimals(),
        enabled,
    });
}
