import { z } from "zod";

export const infrastructureSchema = z.object({
    id: z.number(),
    guid: z.string(),
    huntingDistrictId: z.number(),
    typeId: z.number(),
    notes: z.string().optional(),
    locationX: z.number(),
    locationY: z.number(),
    changedOnDevice: z.string(),
    createdOnDevice: z.string(),
});

export const infrastructuresSchema = z.array(infrastructureSchema);

export type Infrastructure = z.infer<typeof infrastructureSchema>;

export type InfrastructureChange = {
    id: string;
    created: string;
    updated?: string;
    status: "pending" | "active" | "success" | "failure";
    type: "create" | "update" | "delete";
    infrastructure: Infrastructure;
};
