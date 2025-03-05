import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { DistrictDamagesPerDistrictId } from "~/types/district-damages";

export function useDistrictDamagesQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<DistrictDamagesPerDistrictId>(
        queryKeys.districtDamages,
        () => api.getDistrictDamagesPerDistrictId(),
        {
            initialData: userStorage.getDistrictDamagesPerDistrictId(),
            onSuccess: (damages) => {
                logger.log("District damages loaded");
                userStorage.setDistrictDamagesPerDistrictId(damages);
            },
            onError: (error) => {
                logger.error("Failed to load district damages", error);
            },
            enabled,
        }
    );
}
