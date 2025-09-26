import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { queryKeys } from "~/query-client";
import { DrivenHuntStatisticsItem } from "~/types/statistics";

export function useDrivenHuntStatisticsQuery() {
    return useQuery<DrivenHuntStatisticsItem[]>({
        queryKey: queryKeys.drivenHuntsStatistics,
        queryFn: async () => {
            try {
                const drivenHuntStatistics = await api.getDrivenHuntStatistics();
                logger.log("Driven hunt statistics loaded");
                return drivenHuntStatistics;
            } catch (error) {
                logger.error("Failed to load driven hunt statistics", error);
                throw error;
            }
        },
    });
}
