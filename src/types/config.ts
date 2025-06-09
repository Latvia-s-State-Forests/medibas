import { z } from "zod";

export const configSchema = z.object({
    huntSeasonEndDate: z.string(),
    huntSeasonStartDate: z.string(),
    currentSeasonYear: z.string(),
    injuredHuntDownMaxDays: z.string(),
    availablePermitCount: z.string(),
    districtDamagesShowDays: z.string(),
    gpsMaxAge: z.string(),
    gpsMinAccuracy: z.string(),
    gpsTimeout: z.string(),
    status: z.string(),
});

export type Config = z.infer<typeof configSchema>;
