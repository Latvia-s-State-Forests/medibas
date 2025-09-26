import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { queryKeys } from "~/query-client";
import { StatisticsSpeciesItem } from "~/types/statistics";

export function useSpeciesStatisticsQuery() {
    return useQuery<StatisticsSpeciesItem[]>({
        queryKey: queryKeys.speciesStatistics,
        queryFn: async () => {
            try {
                const speciesStatistics = await api.getSpeciesStatistics();
                logger.log("Species statistics loaded");
                return speciesStatistics;
            } catch (error) {
                logger.error("Failed to load species statistics", error);
                throw error;
            }
        },
    });
}
