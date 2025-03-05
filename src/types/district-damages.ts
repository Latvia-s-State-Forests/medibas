import { z } from "zod";
import { DamageTypeId } from "./classifiers";

const districtDamageBaseSchema = z.object({
    id: z.number(),
    locationX: z.number(),
    locationY: z.number(),
    reportCreatedOn: z.string(),
    vmdAcceptedOn: z.string(),
    notes: z.string().optional(),
});

const districtAgriculturalLandDamageSchema = districtDamageBaseSchema.extend({
    damageTypeId: z.literal(DamageTypeId.AgriculturalLand),
    agriculturalTypeId: z.number(),
    speciesResponsibleId: z.number(),
    otherResponsibleSpecies: z.string().optional(),
    damagedAreaHectares: z.number().optional(),
    damagedLivestockCount: z.number().optional(),
});

export type DistrictAgriculturalLandDamage = z.infer<typeof districtAgriculturalLandDamageSchema>;

const districtForestDamageSchema = districtDamageBaseSchema.extend({
    damageTypeId: z.literal(DamageTypeId.Forest),
    damagedAreaHectares: z.number(),
    isForestProtectionDone: z.boolean(),
    damagedTreeSpecies: z.array(z.number()),
    freshDamageVolumeId: z.number(),
    speciesResponsibleId: z.number(),
    otherResponsibleSpecies: z.string().optional(),
    forestDamages: z.array(z.number()),
});

export type DistrictForestDamage = z.infer<typeof districtForestDamageSchema>;

const districtInfrastructureDamageSchema = districtDamageBaseSchema.extend({
    damageTypeId: z.literal(DamageTypeId.Infrastructure),
    infrastructureTypeId: z.number(),
    infrastructureTypeOther: z.string().optional(),
    speciesResponsibleId: z.number(),
    otherResponsibleSpecies: z.string().optional(),
});

export type DistrictInfrastructureDamage = z.infer<typeof districtInfrastructureDamageSchema>;

export const districtDamageSchema = z.discriminatedUnion("damageTypeId", [
    districtAgriculturalLandDamageSchema,
    districtForestDamageSchema,
    districtInfrastructureDamageSchema,
]);

export type DistrictDamage = z.infer<typeof districtDamageSchema>;

export const districtDamagesPerDistrictIdSchema = z.record(z.array(districtDamageSchema));

export type DistrictDamagesPerDistrictId = z.infer<typeof districtDamagesPerDistrictIdSchema>;
