import { z } from "zod";

export const newsItemSchema = z.object({
    id: z.number(),
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
