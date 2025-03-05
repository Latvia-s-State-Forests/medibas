import { compareDesc } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyListMessage } from "~/components/empty-list-message";
import { Header } from "~/components/header";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { useNews } from "~/hooks/use-news";
import { useUserStorage } from "~/machines/authentication-machine";
import { theme } from "~/theme";
import { formatDate } from "~/utils/format-date-time";

export function NewsScreen() {
    const userStorage = useUserStorage();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { setUnreadNewsCount, news } = useNews();

    const setUnreadNewsCountCallback = React.useCallback(() => {
        setUnreadNewsCount(0);
        userStorage.setLatestNewsSeenDate(new Date().toISOString());
    }, [setUnreadNewsCount, userStorage]);

    React.useEffect(() => {
        setUnreadNewsCountCallback();
    }, [setUnreadNewsCountCallback]);

    const sortedNews = React.useMemo(() => {
        return news.sort((a, b) => compareDesc(new Date(a.startDate), new Date(b.startDate)));
    }, [news]);

    return (
        <View style={styles.container}>
            <Header title={t("menu.news.title")} />
            {sortedNews.length === 0 ? (
                <EmptyListMessage icon="envelope" label={t("menu.news.emptyMessage")} />
            ) : (
                <FlatList
                    data={sortedNews}
                    renderItem={({ item }) => {
                        return <ReadOnlyField label={formatDate(item.startDate)} value={item.description} />;
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
});
