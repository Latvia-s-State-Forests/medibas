import { z } from "zod";

export enum NewsNotificationType {
    News = 1,
    DrivenHuntCreated = 2,
    IndividualHuntCreated = 3,
    IndividualHuntViewed = 4,
    IndividualHuntRejected = 5,
}

export const newsItemSchema = z.object({
    id: z.number(),
    sourceId: z.number().optional(),
    notificationTypeId: z.number(),
    startDate: z.string(),
    newsRecipientTypeId: z.number(),
    description: z.string(),
    districts: z
        .array(
            z.object({
                id: z.number(),
                descriptionLv: z.string(),
            })
        )
        .optional(),
});
export const newsSchema = z.array(newsItemSchema);

export type News = z.infer<typeof newsSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
