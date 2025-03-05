import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { NewsItem } from "~/types/news";

export function useNewsQuery() {
    const userStorage = useUserStorage();

    return useQuery<NewsItem[]>(queryKeys.news, () => api.getNews(), {
        initialData: userStorage.getNews(),
        onSuccess: (news) => {
            logger.log("News loaded");
            userStorage.setNews(news);
        },
        onError: (error) => {
            logger.error("Failed to load news", error);
        },
    });
}
