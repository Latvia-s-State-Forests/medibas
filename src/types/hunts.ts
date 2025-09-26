import { z } from "zod";

export type JoinHuntBody = {
    eventGuid?: string;
    participantGuid: string;
    participantRoleId: number;
    fullName: string;
};

export enum HuntEventStatus {
    Scheduled = 1,
    Active = 2,
    Paused = 3,
    Concluded = 4,
    PausedForParticipants = 5,
}

export enum HuntEventType {
    IndividualHunt = 1,
    DrivenHunt = 2,
}

export enum ParticipantRole {
    Hunter = 1,
    Beater = 2,
}

export enum HuntPlace {
    InTheStation = 1,
    WaterBody = 2,
    OutSideStation = 3,
}

export enum HuntedTypeId {
    Hunted = 1,
    Injured = 2,
}

export type Hunters = Array<{
    id?: number;
    personId: number;
    fullName?: string;
    huntersCardNumber?: string;
}>;

const huntPlaceSchema = z.nativeEnum(HuntPlace);

const districtSchema = z.object({
    id: z.number(),
    descriptionLv: z.string(),
});

export const huntEventSchema = z.object({
    vmdCode: z.string(),
    districtIds: z.array(districtSchema),
    meetingTime: z.string().optional(),
    plannedFrom: z.string(),
    plannedTo: z.string(),
    canJoinHuntEvent: z.boolean(),
    status: z.string(),
});

const hunterSchema = z.object({
    id: z.number().optional(),
    guid: z.string(),
    personId: z.number(),
    fullName: z.string(),
    huntersCardNumber: z.string(),
    statusId: z.number(),
});
export type Hunter = z.infer<typeof hunterSchema>;

const guestHunterSchema = z.object({
    id: z.number().optional(),
    guid: z.string(),
    fullName: z.string(),
    guestHuntersCardNumber: z.string(),
    statusId: z.number(),
});
export type GuestHunter = z.infer<typeof guestHunterSchema>;

const beaterSchema = z.object({
    id: z.number().optional(),
    guid: z.string(),
    userId: z.number(),
    fullName: z.string(),
    statusId: z.number(),
    hunterPersonId: z.number().optional(),
});
export type Beater = z.infer<typeof beaterSchema>;

const guestBeaterSchema = z.object({
    id: z.number().optional(),
    guid: z.string(),
    fullName: z.string(),
    statusId: z.number(),
});
export type GuestBeater = z.infer<typeof guestBeaterSchema>;

export const targetSpeciesSchema = z.object({
    speciesId: z.number(),
    permitTypeId: z.number().optional(),
});
export type TargetSpecies = z.infer<typeof targetSpeciesSchema>;

const districtMemberSchema = z.object({
    userId: z.number(),
    personId: z.number(),
    fullName: z.string(),
    huntersCardNumber: z.string(),
});
export type DistrictMember = z.infer<typeof districtMemberSchema>;

//TODO: RESTRUCTURE THIS SCHEMA
export const huntSchema = z.object({
    id: z.number(),
    canUserEdit: z.boolean().optional(),
    vmdCode: z.string(),
    qrCode: z.string().optional(),
    huntEventTypeId: z.number(),
    huntManagerPersonId: z.number().optional(),
    huntManagerName: z.string().optional(),
    huntEventPlaceId: huntPlaceSchema.optional(),
    plannedFrom: z.string(),
    plannedTo: z.string(),
    meetingTime: z.string().optional(),
    isSemiAutomaticWeaponUsed: z.boolean().optional(),
    isNightVisionUsed: z.boolean().optional(),
    isLightSourceUsed: z.boolean().optional(),
    isThermalScopeUsed: z.boolean().optional(),
    propertyName: z.string().optional(),
    huntEventStatusId: z.number(),
    meetingPoint: z
        .object({
            x: z.number(),
            y: z.number(),
        })
        .optional(),
    meetingPointX: z.number().optional(),
    meetingPointY: z.number().optional(),
    notes: z.string().optional(),
    isIndividualHuntApproved: z.boolean().optional(),
    reasonForRejection: z.string().optional(),
    guid: z.string(),
    eventGuid: z.string().optional(),
    isReducedInfo: z.boolean(),
    districts: z.array(
        z.object({
            id: z.number(),
            descriptionLv: z.string(),
        })
    ),
    districtMembers: z.array(districtMemberSchema).optional(),
    hunters: z.array(hunterSchema),
    guestHunters: z.array(guestHunterSchema),
    beaters: z.array(beaterSchema),
    guestBeaters: z.array(guestBeaterSchema),
    hasTargetSpecies: z.boolean(),
    targetSpecies: z.array(targetSpeciesSchema),
    dogs: z.array(
        z.object({
            id: z.number().optional(),
            guid: z.string(),
            dogBreedId: z.number(),
            dogSubbreedId: z.number().optional(),
            dogBreedOther: z.string().optional(),
            count: z.number(),
        })
    ),
    huntedAnimals: z.array(
        z.object({
            speciesId: z.number(),
            huntedTypeId: z.number().optional(),
            strapNumber: z.string().optional(),
        })
    ),
});
export const huntsSchema = z.array(huntSchema);

export type Hunt = z.infer<typeof huntSchema>;
export type Hunts = z.infer<typeof huntsSchema>;
export type HuntEvent = z.infer<typeof huntEventSchema>;

export const approveOrRejectIndividualHuntSchema = z.object({
    id: z.number(),
    isApproved: z.boolean(),
    reasonForRejection: z.string().optional(),
});

export type ApproveOrRejectIndividualHunt = z.infer<typeof approveOrRejectIndividualHuntSchema>;

export type HuntsRequestTiming = {
    startedAt: string;
    finishedAt: string;
    duration: number;
};
