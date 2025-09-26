import { z } from "zod";

export const statisticsSpeciesSchema = z.object({
    animalObservationId: z.number(),
    huntReportId: z.number(),
    speciesId: z.number(),
    huntedTime: z.string(),
    notes: z.string(),
    permitTypeId: z.number(),
    location: z.tuple([z.number(), z.number()]),
    huntSeason: z.string(),
    strapNumber: z.string().optional(),
    districtId: z.number().optional(),
    genderId: z.number(),
    ageId: z.number(),
    count: z.number(),
    hasSignsOfDisease: z.boolean(),
});

export const statisticsSpeciesResponseSchema = z.object({
    statistics: z.array(statisticsSpeciesSchema),
});

export type StatisticsSpecies = z.infer<typeof statisticsSpeciesResponseSchema>;
export type StatisticsSpeciesItem = z.infer<typeof statisticsSpeciesSchema>;

export const individualHuntStatisticsSchema = z.object({
    huntSeason: z.string(),
    huntEventId: z.number(),
    huntEventCode: z.string(),
    huntEventTypeId: z.number(),
    notes: z.string(),
    plannedFrom: z.string(),
    plannedTo: z.string(),
    meetingPoint: z.union([z.tuple([]), z.tuple([z.number(), z.number()])]),
    hasTargetSpecies: z.boolean(),
    huntEventPlaceId: z.number(),
    propertyName: z.string(),
    isSemiAutomaticWeaponUsed: z.boolean(),
    isNightVisionUsed: z.boolean(),
    isLightSourceUsed: z.boolean(),
    isThermalScopeUsed: z.boolean(),
    timeSpentInHuntMinutes: z.number(),
    hunters: z.array(
        z.object({
            id: z.number(),
            fullName: z.string(),
            huntersCardNumber: z.string(),
        })
    ),
    districts: z.array(
        z.object({
            id: z.number(),
            descriptionLv: z.string(),
        })
    ),
    dogs: z.array(
        z.object({
            dogBreedId: z.number(),
            dogBreedOther: z.string().optional(),
            dogSubbreedId: z.number().optional(),
            count: z.number(),
        })
    ),
    targetSpecies: z.array(
        z.object({
            speciesId: z.number(),
            permitTypeId: z.number().optional(),
        })
    ),
    huntedAnimals: z.array(
        z.object({
            speciesId: z.number(),
            strapNumber: z.string().optional(),
            huntedTypeId: z.number().optional(),
        })
    ),
});

export const individualHuntStatisticsResponseSchema = z.object({
    statistics: z.array(individualHuntStatisticsSchema),
});

export type IndividualHuntStatisticsItem = z.infer<typeof individualHuntStatisticsSchema>;

// Driven hunt statistics schema
export const drivenHuntStatisticsSchema = z.object({
    huntSeason: z.string(),
    huntEventId: z.number(),
    huntEventCode: z.string(),
    huntEventTypeId: z.number(),
    notes: z.string(),
    plannedFrom: z.string(),
    plannedTo: z.string(),
    meetingPoint: z.union([z.tuple([]), z.tuple([z.number(), z.number()])]),
    hasTargetSpecies: z.boolean(),
    huntManagerName: z.string(),
    meetingTime: z.string().optional(),
    timeSpentInHuntMinutes: z.number(),
    districts: z.array(
        z.object({
            id: z.number(),
            descriptionLv: z.string(),
        })
    ),
    hunters: z.array(
        z.object({
            id: z.number(),
            fullName: z.string(),
            huntersCardNumber: z.string(),
        })
    ),
    beaters: z.array(
        z.object({
            id: z.number(),
            fullName: z.string(),
        })
    ),
    guestHunters: z.array(
        z.object({
            id: z.number(),
            fullName: z.string(),
            guestHuntersCardNumber: z.string(),
        })
    ),
    guestBeaters: z.array(
        z.object({
            id: z.number(),
            fullName: z.string(),
        })
    ),
    dogs: z.array(
        z.object({
            dogBreedId: z.number(),
            dogBreedOther: z.string().optional(),
            dogSubbreedId: z.number().optional(),
            count: z.number(),
        })
    ),
    targetSpecies: z.array(
        z.object({
            speciesId: z.number(),
            permitTypeId: z.number().optional(),
        })
    ),
    huntedAnimals: z.array(
        z.object({
            speciesId: z.number(),
            strapNumber: z.string().optional(),
            huntedTypeId: z.number().optional(),
        })
    ),
});

export const drivenHuntStatisticsResponseSchema = z.object({
    statistics: z.array(drivenHuntStatisticsSchema),
});

export type DrivenHuntStatisticsItem = z.infer<typeof drivenHuntStatisticsSchema>;
