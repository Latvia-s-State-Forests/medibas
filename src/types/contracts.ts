import { z } from "zod";

export const contractSchema = z.object({
    id: z.number(),
    contractNumber: z.string(),
    masterDistrictId: z.number(),
    permits: z.array(
        z.object({
            permitTypeId: z.number(),
            used: z.number(),
            issued: z.number(),
            available: z.number(),
            assignedPermits: z.array(
                z.object({
                    districtId: z.number(),
                    unused: z.number(),
                })
            ),
        })
    ),
    districts: z.array(
        z.object({
            districtId: z.number(),
            descriptionLv: z.string(),
        })
    ),
});

export const postContractPermitsBodySchema = z.object({
    contractNumber: z.string(),
    permitTypeId: z.number(),
    permits: z.array(
        z.object({
            districtId: z.number(),
            permitCount: z.number(),
            hasAssignedPermits: z.boolean(),
        })
    ),
});

export type Contract = z.infer<typeof contractSchema>;
export type PostContractPermitsBody = z.infer<typeof postContractPermitsBodySchema>;

export const getContractsResponseSchema = z.object({
    contracts: z.array(contractSchema),
    status: z.literal("ok"),
});

export type GetContractsResponse = z.infer<typeof getContractsResponseSchema>;
