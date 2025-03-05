import { z } from "zod";

export const permitSchema = z.object({
    strapNumber: z.string(),
    validFrom: z.string(),
    validTo: z.string(),
    id: z.number(),
    strapStatusId: z.number(),
    permitTypeId: z.number(),
    huntedTypeId: z.number().optional(),
    permitAllowanceId: z.number().optional(),
    injuredDate: z.string().optional(),
    isReportEditingEnabled: z.boolean().optional(),
    huntingDistrictIds: z.array(z.number()),
    issuedHuntingDistrictIds: z.array(z.number()),
    reportId: z.number().optional(),
    reportGuid: z.string().optional(),
});

export type Permit = z.infer<typeof permitSchema>;

export const permitsSchema = z.array(permitSchema);

export type Permits = z.infer<typeof permitsSchema>;

export enum StrapStatusId {
    Unused = 1,
    Used = 2,
    Cancelled = 3,
}
