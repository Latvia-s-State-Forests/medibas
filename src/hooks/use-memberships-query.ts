import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Membership } from "~/types/mtl";

export function useMembershipsQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<Membership[]>(queryKeys.memberships, () => api.getMemberships(), {
        initialData: userStorage.getMemberships(),
        onSuccess: (memberships) => {
            logger.log("Memberships loaded");
            userStorage.setMemberships(memberships);
        },
        onError: (error) => {
            logger.error("Failed to load memberships", error);
        },
        enabled,
    });
}
