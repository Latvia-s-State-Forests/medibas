import { z } from "zod";

export enum NotificationType {
    News = "news",
    DrivenHuntCreated = "dh_created",
    IndividualHuntCreated = "ih_created",
    IndividualHuntViewed = "ih_viewed",
    IndividualHuntRejected = "ih_rejected",
}

export type NotificationData = {
    type?: NotificationType;
    newsId?: number;
    sourceId?: number;
};

export const pushNotificationsTokenSchema = z.object({
    token: z.string(),
    language: z.union([z.literal("lv"), z.literal("en"), z.literal("ru")]),
});

export type PushNotificationsToken = z.infer<typeof pushNotificationsTokenSchema>;
