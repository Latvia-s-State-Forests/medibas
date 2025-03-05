import { z } from "zod";

export interface ProfileConfig {
    huntingDistrictId: number;
}

const hunterCardSchema = z.object({
    id: z.number(),
    cardNumber: z.string(),
    cardTypeId: z.number(),
    validFrom: z.string().optional(),
    validTo: z.string().optional(),
});

export type HunterCard = z.infer<typeof hunterCardSchema>;

const huntingDistrictSchema = z.object({
    id: z.number(),
    descriptionLv: z.string(),
});

export type HuntingDistrict = z.infer<typeof huntingDistrictSchema>;

const huntingMembershipSchema = z.object({
    id: z.number(),
    huntingDistrictId: z.number(),
    huntingDistrict: huntingDistrictSchema,
    isMember: z.boolean(),
    isHunter: z.boolean(),
    isManager: z.boolean(),
    isAdministrator: z.boolean(),
    isTrustee: z.boolean(),
});

export type HuntingMembership = z.infer<typeof huntingMembershipSchema>;

export const profileSchema = z.object({
    id: z.number(),
    personId: z.number().optional(),
    vmdId: z.string().optional(),
    validHuntersCardNumber: z.string().optional(),
    validHuntManagerCardNumber: z.string().optional(),
    isHunter: z.boolean().optional(),
    hunterCards: z.array(hunterCardSchema),
    memberships: z.array(huntingMembershipSchema),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export const profileQrCodeSchema = z.object({
    /**
     * User id
     */
    uid: z.number(),
    /**
     * Person id
     */
    pid: z.number().optional(),
    /**
     * First name
     */
    fn: z.string(),
    /**
     * Last name
     */
    ln: z.string(),
    /**
     * Hunters card number
     */
    cn: z.string().optional(),
    /**
     * Is season card valid
     */
    sc: z.boolean().optional(),
});
export type ProfileQrCode = z.infer<typeof profileQrCodeSchema>;

export type ProfileName = {
    firstName: string;
    lastName: string;
};
