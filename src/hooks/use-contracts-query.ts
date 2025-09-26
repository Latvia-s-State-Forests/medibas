import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Contract } from "~/types/contracts";

export function useContractsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<Contract[]>({
        queryKey: queryKeys.contracts,
        queryFn: async () => {
            try {
                const contracts = await api.getContracts();
                logger.log("Contracts loaded");
                userStorage.setContracts(contracts);
                return contracts;
            } catch (error) {
                logger.error("Failed to load contracts", error);
                throw error;
            }
        },
        initialData: () => userStorage.getContracts(),
        enabled,
    });
}
