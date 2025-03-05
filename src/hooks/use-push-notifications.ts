import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as React from "react";
import { Platform } from "react-native";
import { api } from "~/api";
import { getAppLanguage, i18n } from "~/i18n";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryClient, queryKeys } from "~/query-client";
import { NotificationData, NotificationType, PushNotificationsToken } from "~/types/notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export function usePushNotifications() {
    const navigation = useNavigation();
    const userStorage = useUserStorage();

    // Register for push notifications
    React.useEffect(() => {
        async function registerForPushNotifications() {
            if (Platform.OS === "android") {
                const channels = [
                    { id: NotificationType.News, name: i18n.t("notifications.news") },
                    { id: NotificationType.DrivenHuntCreated, name: i18n.t("notifications.dh_created") },
                    { id: NotificationType.IndividualHuntCreated, name: i18n.t("notifications.ih_created") },
                    { id: NotificationType.IndividualHuntViewed, name: i18n.t("notifications.ih_viewed") },
                    { id: NotificationType.IndividualHuntRejected, name: i18n.t("notifications.ih_rejected") },
                ];
                for (const channel of channels) {
                    await Notifications.setNotificationChannelAsync(channel.id, {
                        name: channel.name,
                        importance: Notifications.AndroidImportance.MAX,
                    });
                }
            }

            let permissionsResult = await Notifications.getPermissionsAsync();
            if (!permissionsResult.granted) {
                permissionsResult = await Notifications.requestPermissionsAsync();
                if (!permissionsResult.granted) {
                    throw new Error("Permissions rejected");
                }
            }
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error("Project ID not found");
            }
            const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

            // Avoid submitting push notification token to API during development, because doing so would result in errors when sending notifications to mixed clients
            if (!__DEV__) {
                return;
            }

            const language = getAppLanguage();

            // Avoid submitting an unchanged token
            const oldToken = userStorage.getPushNotificationsToken();
            const newToken: PushNotificationsToken = { token, language };
            if (oldToken && oldToken.token === newToken.token && oldToken.language === newToken.language) {
                return;
            }

            logger.log("Submitting push notifications token");
            await api.postPushNotificationsToken(newToken);
            logger.log("Push notifications token submitted");

            userStorage.setPushNotificationsToken(newToken);
        }

        registerForPushNotifications().catch((error) => {
            logger.error("Failed to register for push notifications", error);
        });
    }, [userStorage]);

    // Handle received notification
    React.useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
            const { title, body, data } = notification.request.content;
            logger.log("Notification received", { title, body, data });
        });
        return () => {
            subscription.remove();
        };
    }, []);

    // Handle opened notification
    React.useEffect(() => {
        async function onNotificationOpened(notification: Notifications.NotificationContent) {
            // Ignore system notifications
            if (!notification.title) {
                return;
            }

            const title = notification.title;
            const body = notification.body;

            // Notification data might be unavailable or misplaced (on Android when notification has no body, notification.content.data equals notification.request.trigger.remoteMessage.data)
            let data: NotificationData;
            if (!notification.data) {
                logger.error("Notification missing data", notification);
                return;
            } else if (typeof notification.data.body === "string") {
                try {
                    data = JSON.parse(notification.data.body);
                } catch (error) {
                    logger.error("Failed to parse notification data", notification, error);
                    return;
                }
            } else {
                data = notification.data;
            }

            logger.log("Notification opened", { title, body, data });

            switch (data.type) {
                case "news": {
                    await queryClient.refetchQueries(queryKeys.news);
                    navigation.navigate("MenuScreen");
                    navigation.navigate("NewsScreen");
                    break;
                }
                case "dh_created": {
                    if (data.sourceId) {
                        await queryClient.refetchQueries(queryKeys.hunts);
                        navigation.navigate("TabsNavigator", { screen: "HuntScreen" });
                        navigation.navigate("DrivenHuntListScreen");
                        navigation.navigate("DrivenHuntDetailScreen", { huntId: data.sourceId });
                    } else {
                        logger.error("Notification missing huntId");
                    }
                    break;
                }
                case "ih_created":
                case "ih_viewed":
                case "ih_rejected": {
                    if (data.sourceId) {
                        await queryClient.refetchQueries(queryKeys.hunts);
                        navigation.navigate("TabsNavigator", { screen: "HuntScreen" });
                        navigation.navigate("IndividualHuntListScreen");
                        navigation.navigate("IndividualHuntDetailScreen", { huntId: data.sourceId });
                    } else {
                        logger.error("Notification missing huntId");
                    }
                    break;
                }
                default: {
                    logger.error("Notification has unknown type");
                    break;
                }
            }
        }

        let subscription: Notifications.EventSubscription | undefined;

        Notifications.getLastNotificationResponseAsync()
            .then((response) => {
                if (response) {
                    onNotificationOpened(response.notification.request.content);
                }
                return Notifications.clearLastNotificationResponseAsync();
            })
            .then(() => {
                subscription = Notifications.addNotificationResponseReceivedListener((response) => {
                    onNotificationOpened(response.notification.request.content);
                });
            });

        return () => {
            subscription?.remove();
        };
    }, [navigation]);
}
