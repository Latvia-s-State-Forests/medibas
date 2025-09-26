import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Membership } from "~/types/mtl";

export function useMembershipsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<Membership[]>({
        queryKey: queryKeys.memberships,
        queryFn: async () => {
            try {
                const memberships = await api.getMemberships();
                logger.log("Memberships loaded");
                userStorage.setMemberships(memberships);
                return memberships;
            } catch (error) {
                logger.error("Failed to load memberships", error);
                throw error;
            }
        },
        initialData: () => userStorage.getMemberships(),
        enabled,
    });
}
