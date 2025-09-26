import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { DistrictDamagesPerDistrictId } from "~/types/district-damages";

export function useDistrictDamagesQuery(enabled: boolean) {
    const userStorage = useUserStorage();

    return useQuery<DistrictDamagesPerDistrictId>({
        queryKey: queryKeys.districtDamages,
        queryFn: async () => {
            try {
                const districtDamagesPerDistrictId = await api.getDistrictDamagesPerDistrictId();
                logger.log("District damages loaded");
                userStorage.setDistrictDamagesPerDistrictId(districtDamagesPerDistrictId);
                return districtDamagesPerDistrictId;
            } catch (error) {
                logger.error("Failed to load district damages", error);
                throw error;
            }
        },
        initialData: () => userStorage.getDistrictDamagesPerDistrictId(),
        enabled,
    });
}
