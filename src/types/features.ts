import { z } from "zod";

const featureSchema = z.object({
    type: z.literal("Feature"),
    geometry: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    properties: z.record(z.any()),
});

export type Feature = z.infer<typeof featureSchema>;

export const featuresSchema = z.object({
    observations: z.array(featureSchema),
    damages: z.array(featureSchema),
});

export type Features = z.infer<typeof featuresSchema>;
