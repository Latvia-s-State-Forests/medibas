import { useNavigation } from "@react-navigation/native";
import { compareDesc } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyListMessage } from "~/components/empty-list-message";
import { Header } from "~/components/header";
import { NewsListItem } from "~/components/news-list-item";
import { Spacer } from "~/components/spacer";
import { useHunts } from "~/hooks/use-hunts";
import { useNews } from "~/hooks/use-news";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { Hunt } from "~/types/hunts";
import { NewsNotificationType } from "~/types/news";
import { formatDate } from "~/utils/format-date-time";
import { NewsStatusModal } from "./news-status-modal";

export function NewsScreen() {
    const userStorage = useUserStorage();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { setUnreadNewsCount, news } = useNews();
    const hunts = useHunts();
    const [modalState, setModalState] = React.useState<"hidden" | "loading" | "error" | "hunt-not-found">("hidden");
    const [currentHuntId, setCurrentHuntId] = React.useState<number | null>(null);
    const [currentNotificationTypeId, setCurrentNotificationTypeId] = React.useState<number | null>(null);

    React.useEffect(() => {
        setUnreadNewsCount(0);
        userStorage.setLatestNewsSeenDate(new Date().toISOString());
    }, [setUnreadNewsCount, userStorage]);

    const sortedNews = React.useMemo(() => {
        return news.sort((a, b) => compareDesc(new Date(a.startDate), new Date(b.startDate)));
    }, [news]);

    function navigateToHuntScreen(hunt: Hunt, huntId: number, notificationTypeId: NewsNotificationType) {
        if (notificationTypeId === NewsNotificationType.IndividualHuntCreated) {
            navigation.navigate("IndividualHuntDetailScreen", { huntId });
        } else if (notificationTypeId === NewsNotificationType.DrivenHuntCreated) {
            navigation.navigate(hunt.isReducedInfo ? "DrivenHuntReducedDetailScreen" : "DrivenHuntDetailScreen", {
                huntId,
            });
        }
    }

    function clearStatusDialog() {
        setModalState("hidden");
        setCurrentHuntId(null);
        setCurrentNotificationTypeId(null);
    }

    async function fetchHunt(huntId: number, notificationTypeId: NewsNotificationType) {
        setModalState("loading");
        try {
            await queryClient.refetchQueries({ queryKey: queryKeys.hunts }, { throwOnError: true });
            const fetchedHunts: Hunt[] = queryClient.getQueryData(queryKeys.hunts) ?? [];

            const foundHunt = fetchedHunts.find((h) => h.id === huntId);

            if (foundHunt) {
                navigateToHuntScreen(foundHunt, huntId, notificationTypeId);
                clearStatusDialog();
            } else {
                setModalState("hunt-not-found");
            }
        } catch (error) {
            logger.error("Failed to fetch hunt:", error);
            setModalState("error");
        }
    }

    async function onNewsItemPress(huntId: number, notificationTypeId: NewsNotificationType) {
        const existing = hunts.find((h) => h.id === huntId);
        if (existing) {
            navigateToHuntScreen(existing, huntId, notificationTypeId);
            return;
        }

        setCurrentHuntId(huntId);
        setCurrentNotificationTypeId(notificationTypeId);
        await fetchHunt(huntId, notificationTypeId);
    }

    async function onRetry() {
        if (currentHuntId !== null && currentNotificationTypeId !== null) {
            await fetchHunt(currentHuntId, currentNotificationTypeId);
        }
    }

    function onCancel() {
        clearStatusDialog();
    }

    return (
        <View style={styles.container}>
            <Header title={t("menu.news.title")} />
            {sortedNews.length === 0 ? (
                <EmptyListMessage icon="envelope" label={t("menu.news.emptyMessage")} />
            ) : (
                <FlatList
                    data={sortedNews}
                    renderItem={({ item }) => {
                        const hasHuntEvent =
                            item.sourceId !== null &&
                            (item.notificationTypeId === NewsNotificationType.IndividualHuntCreated ||
                                item.notificationTypeId === NewsNotificationType.DrivenHuntCreated);

                        return (
                            <NewsListItem
                                label={formatDate(item.startDate)}
                                value={item.description}
                                pressable={hasHuntEvent}
                                onPress={() => {
                                    if (hasHuntEvent && item.sourceId) {
                                        onNewsItemPress(item.sourceId, item.notificationTypeId);
                                    }
                                }}
                            />
                        );
                    }}
                    keyExtractor={(item) => item.id.toString()}
                    ItemSeparatorComponent={() => <Spacer size={24} />}
                    ListFooterComponent={<View style={{ height: insets.bottom + 24 }} />}
                    ListHeaderComponent={() => <Spacer size={24} />}
                    contentContainerStyle={{
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                    }}
                />
            )}

            <NewsStatusModal
                isLoading={modalState === "loading"}
                isError={modalState === "error"}
                isHuntNotFound={modalState === "hunt-not-found"}
                onRetry={onRetry}
                onCancel={onCancel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
});
