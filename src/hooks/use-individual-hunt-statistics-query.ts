import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { queryKeys } from "~/query-client";
import { IndividualHuntStatisticsItem } from "~/types/statistics";

export function useIndividualHuntStatisticsQuery() {
    return useQuery<IndividualHuntStatisticsItem[]>({
        queryKey: queryKeys.individualHuntsStatistics,
        queryFn: async () => {
            try {
                const individualHuntsStatistics = await api.getIndividualHuntStatistics();
                logger.log("Individual hunt statistics loaded");
                return individualHuntsStatistics;
            } catch (error) {
                logger.error("Failed to load individual hunt statistics", error);
                throw error;
            }
        },
    });
}
