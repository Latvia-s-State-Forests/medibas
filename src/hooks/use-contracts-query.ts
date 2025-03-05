import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Contract } from "~/types/contracts";

export function useContractsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<Contract[]>(queryKeys.contracts, () => api.getContracts(), {
        initialData: userStorage.getContracts(),
        onSuccess: (contracts) => {
            logger.log("Contracts loaded");
            userStorage.setContracts(contracts);
        },
        onError: (error) => {
            logger.error("Failed to load contracts", error);
        },
        enabled,
    });
}
