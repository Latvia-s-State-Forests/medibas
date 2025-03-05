import { z } from "zod";

export enum MemberRole {
    Trustee = "trustee",
    Administrator = "administrator",
    Manager = "manager",
    Hunter = "hunter",
    Member = "member",
}

const memberSchema = z.object({
    id: z.number(),
    userId: z.number(),
    cardNumber: z.string().optional(),
    managerCardNumber: z.string().optional(),
    roles: z.array(z.nativeEnum(MemberRole)),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    validSeasonCard: z
        .object({
            validFrom: z.string(),
            validTo: z.string(),
        })
        .optional(),
});

export type Member = z.infer<typeof memberSchema>;

export const membershipSchema = z.object({
    id: z.number(),
    name: z.string(),
    members: z.array(memberSchema),
});

export type Membership = z.infer<typeof membershipSchema>;

export const membershipsSchema = z.array(membershipSchema);

export type Memberships = z.infer<typeof membershipsSchema>;
