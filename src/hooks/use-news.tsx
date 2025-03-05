import * as React from "react";
import { useUserStorage } from "~/machines/authentication-machine";
import { NewsItem } from "~/types/news";
import { useNewsQuery } from "./use-news-query";

type InitialNewsProviderProps = {
    children: React.ReactNode;
};

type NewsContextType = {
    unreadNewsCount: number;
    setUnreadNewsCount: React.Dispatch<React.SetStateAction<number>>;
    news: NewsItem[];
};

export const NewsContext = React.createContext<NewsContextType | null>(null);

export function NewsProvider(props: InitialNewsProviderProps) {
    const [unreadNewsCount, setUnreadNewsCount] = React.useState(0);
    const userStorage = useUserStorage();
    const newsQuery = useNewsQuery();
    const news = newsQuery.data ?? [];
    const latestSeenDateFromStorage = userStorage.getLatestNewsSeenDate();
    const latestSeenDate = latestSeenDateFromStorage ? new Date(latestSeenDateFromStorage) : new Date(0);
    const unreadNews = news.filter((item) => new Date(item.startDate) > latestSeenDate);

    React.useEffect(() => {
        setUnreadNewsCount(unreadNews.length);
    }, [unreadNews]);

    return (
        <NewsContext.Provider value={{ unreadNewsCount, setUnreadNewsCount, news }}>
            {props.children}
        </NewsContext.Provider>
    );
}

export function useNews() {
    const news = React.useContext(NewsContext);

    if (!news) {
        throw new Error("News Context not initialized");
    }

    return news;
}
