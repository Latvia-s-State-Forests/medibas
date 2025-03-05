import { z } from "zod";

export const districtSchema = z.object({
    id: z.number(),
    shapeWgs: z.object({
        type: z.literal("MultiPolygon"),
        coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))),
    }),
    inAfricanSwineFeverZone: z.boolean().optional(), //TODO: remove optional
});

export type District = z.infer<typeof districtSchema>;
