import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { NewsItem } from "~/types/news";

export function useNewsQuery() {
    const userStorage = useUserStorage();

    return useQuery<NewsItem[]>({
        queryKey: queryKeys.news,
        queryFn: async () => {
            try {
                const news = await api.getNews();
                logger.log("News loaded");
                userStorage.setNews(news);
                return news;
            } catch (error) {
                logger.error("Failed to load news", error);
                throw error;
            }
        },
        initialData: () => userStorage.getNews(),
    });
}
