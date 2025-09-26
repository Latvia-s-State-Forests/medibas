import { z } from "zod";

export const unlimitedHuntedAnimalSchema = z.object({
    animalObservationId: z.number(),
    huntReportId: z.number(),
    speciesId: z.number(),
    huntedTime: z.string(),
    notes: z.string().optional(),
    location: z.tuple([z.number(), z.number()]),
    districtId: z.number(),
});

export const unlimitedHuntedAnimalsSchema = z.array(unlimitedHuntedAnimalSchema);

export type UnlimitedHuntedAnimals = z.infer<typeof unlimitedHuntedAnimalsSchema>;
export type UnlimitedHuntedAnimal = z.infer<typeof unlimitedHuntedAnimalSchema>;
