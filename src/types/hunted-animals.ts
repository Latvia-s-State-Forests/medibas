import { z } from "zod";

export const huntedAnimalSchema = z.object({
    animalObservationId: z.number(),
    huntReportId: z.number(),
    speciesId: z.number(),
    huntedTime: z.string(),
    notes: z.string().optional(),
    permitTypeId: z.number(),
    strapNumber: z.string(),
    location: z.tuple([z.number(), z.number()]),
    districtId: z.number(),
});

export const huntedAnimalsSchema = z.array(huntedAnimalSchema);

export type HuntedAnimals = z.infer<typeof huntedAnimalsSchema>;
export type HuntedAnimal = z.infer<typeof huntedAnimalSchema>;
