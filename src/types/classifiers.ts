import { z } from "zod";

const classifierOptionDescriptionSchema = z.object({
    en: z.string().nullable(),
    lv: z.string().nullable(),
    ru: z.string().nullable(),
});
export type ClassifierOptionDescription = z.infer<typeof classifierOptionDescriptionSchema>;

export const classifierOptionSchema = z.object({
    id: z.number(),
    activeFrom: z.string().optional(),
    activeTo: z.string().optional(),
    description: classifierOptionDescriptionSchema,
    isPlannedSpeciesInHuntEvent: z.number().optional(),
});

export type ClassifierOption = z.infer<typeof classifierOptionSchema>;

const dogSubBreedOptionSchema = classifierOptionSchema.extend({
    breedId: z.number(),
});
export type DogSubBreedOption = z.infer<typeof dogSubBreedOptionSchema>;

const classifierSchema = z.object({
    defaultValue: z.number().optional(),
    options: z.array(classifierOptionSchema),
});
export type Classifier = z.infer<typeof classifierSchema>;

const agriculturalLandTypeOptionSchema = classifierOptionSchema.extend({
    isCountable: z.boolean().optional(),
    isMainType: z.boolean().optional(),
});
export type AgriculturalLandTypeClassifierOption = z.infer<typeof agriculturalLandTypeOptionSchema>;

const agriculturalLandTypeSchema = classifierSchema.extend({
    options: z.array(agriculturalLandTypeOptionSchema),
});
export type AgriculturalLandTypeClassifier = z.infer<typeof agriculturalLandTypeSchema>;

const errorMessageClassifierOptionSchema = classifierOptionSchema.extend({
    isUserFriendly: z.boolean(),
});
export type ErrorMessageClassifierOption = z.infer<typeof errorMessageClassifierOptionSchema>;

const errorMessageClassifierSchema = classifierSchema.extend({
    options: z.array(errorMessageClassifierOptionSchema),
});
export type ErrorMessageClassifier = z.infer<typeof errorMessageClassifierSchema>;

const speciesProfileSchema = classifierOptionSchema.extend({
    isLimited: z.boolean(),
    isPermitNumberAssignedBeforeHunt: z.boolean(),
    isForDistrictMembersOnly: z.boolean(),
    showPermitCount: z.boolean(),
});
const speciesProfilesOptionsSchema = z.object({
    options: z.array(speciesProfileSchema),
});

export type SpeciesProfileOptions = z.infer<typeof speciesProfilesOptionsSchema>;
export type SpeciesProfile = z.infer<typeof speciesProfileSchema>;

export const speciesClassifierOptionSchema = classifierOptionSchema.extend({
    doesDamageBees: z.boolean().optional(),
    doesDamageCrops: z.boolean().optional(),
    doesDamageForest: z.boolean().optional(),
    doesDamageInfrastructure: z.boolean().optional(),
    doesDamageLivestock: z.boolean().optional(),
    doesDamagePoultry: z.boolean().optional(),
    isLimited: z.boolean().optional(),
    isMainGroupHunt: z.boolean().optional(),
    isMainGroupObservation: z.boolean().optional(),
    isMammal: z.boolean().optional(),
    isValidForObservation: z.boolean().optional(),
    listOrderDamageForest: z.number().optional(),
    listOrderDamageBees: z.number().optional(),
    listOrderDamageCrops: z.number().optional(),
    listOrderDamageInfrastructure: z.number().optional(),
    listOrderDamageLivestock: z.number().optional(),
    listOrderDamagePoultry: z.number().optional(),
    listOrderHunt: z.number().optional(),
    listOrderObservation: z.number().optional(),
    speciesProfileId: z.number().optional(),
    subspeciesOfId: z.number().optional(),
});
export type SpeciesClassifierOption = z.infer<typeof speciesClassifierOptionSchema>;

const speciesClassifierSchema = classifierSchema.extend({
    options: z.array(speciesClassifierOptionSchema),
});
export type SpeciesClassifier = z.infer<typeof speciesClassifierSchema>;

const huntingSeasonsClassifierOptionSchema = classifierOptionSchema.extend({
    seasonEndDay: z.number(),
    seasonEndMonth: z.number(),
    seasonStartDay: z.number(),
    seasonStartMonth: z.number(),
    speciesId: z.number(),
});
export type HuntingSeasonsClassifierOption = z.infer<typeof huntingSeasonsClassifierOptionSchema>;

const huntingSeasonsClassifierSchema = classifierSchema.extend({
    options: z.array(huntingSeasonsClassifierOptionSchema),
});
export type HuntingSeasonsClassifier = z.infer<typeof huntingSeasonsClassifierSchema>;

export const permitTypeClassifierOptionSchema = classifierOptionSchema.extend({
    seasonEndDay: z.number(),
    seasonEndMonth: z.number(),
    seasonStartDay: z.number(),
    seasonStartMonth: z.number(),
    speciesId: z.number(),
});
export type PermitTypeClassifierOption = z.infer<typeof permitTypeClassifierOptionSchema>;

const permitTypeClassifierSchema = classifierSchema.extend({
    options: z.array(permitTypeClassifierOptionSchema),
});
export type PermitTypeClassifier = z.infer<typeof permitTypeClassifierSchema>;

const permitAllowanceClassifierOption = classifierOptionSchema.extend({
    ageId: z.number(),
    genderId: z.number(),
    isComplex: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    isValidForKilled: z.boolean(),
    permitTypeId: z.number(),
});
export type PermitAllowanceClassifierOption = z.infer<typeof permitAllowanceClassifierOption>;

const permitAllowanceClassifierSchema = classifierSchema.extend({
    options: z.array(permitAllowanceClassifierOption),
});
export type PermitAllowanceClassifier = z.infer<typeof permitAllowanceClassifierSchema>;

const treeSpeciesClassifierOptionSchema = classifierOptionSchema.extend({
    isMainGroupDamage: z.boolean(),
    listOrder: z.number().optional(),
});
export type TreeSpeciesClassifierOption = z.infer<typeof treeSpeciesClassifierOptionSchema>;

const treeSpeciesClassifierSchema = classifierSchema.extend({
    options: z.array(treeSpeciesClassifierOptionSchema),
});
export type TreeSpeciesClassifier = z.infer<typeof treeSpeciesClassifierSchema>;

export const classifiersSchema = z.object({
    ages: classifierSchema,
    agriculturalTypes: agriculturalLandTypeSchema,
    damagedAreaTypes: classifierSchema,
    damageTypes: classifierSchema,
    damageVolumeTypes: classifierSchema,
    deathTypes: classifierSchema,
    dogBreeds: classifierSchema,
    dogSubbreeds: classifierSchema.extend({
        options: z.array(dogSubBreedOptionSchema),
    }),
    errorMessages: errorMessageClassifierSchema,
    forestDamageTypes: classifierSchema,
    genders: classifierSchema,
    huntedTypes: classifierSchema,
    huntersCardTypes: classifierSchema,
    huntingSeasons: huntingSeasonsClassifierSchema,
    infrastructureTypes: classifierSchema,
    observationTypes: classifierSchema,
    observedSigns: classifierSchema,
    permitAllowances: permitAllowanceClassifierSchema,
    permitTypes: permitTypeClassifierSchema,
    diseaseSigns: classifierSchema,
    animalSpecies: speciesClassifierSchema,
    strapStatuses: classifierSchema,
    treeSpecies: treeSpeciesClassifierSchema,
    speciesProfiles: speciesProfilesOptionsSchema,
});
export type Classifiers = z.infer<typeof classifiersSchema>;

export enum ObservationTypeId {
    DirectlyObservedAnimals = 1,
    SignsOfPresence = 2,
    Dead = 3,
}

export enum SpeciesId {
    Moose = 1,
    RedDeer = 2,
    RoeDeer = 3,
    WildBoar = 4,
    Lynx = 5,
    Wolf = 6,
    WesternCapercaillie = 7,
    BlackGrouse = 8,
    Fox = 9,
    RaccoonDog = 10,
    Beaver = 11,
    Badger = 12,
    Hare = 13,
    EuropeanHare = 14,
    MountainHare = 15,
    Marten = 16,
    EuropeanPineMarten = 17,
    BeechMarten = 18,
    Polecat = 19,
    AmericanMink = 20,
    Raccoon = 21,
    Muskrat = 22,
    FallowDeer = 23,
    Mouflon = 24,
    SikaDeer = 25,
    Nutria = 26,
    BobakMarmot = 27,
    GoldenJackal = 28,
    Bear = 29,
    OtherMammals = 30,
    Birds = 31,
    HazelGrouse = 32,
    Rackelhahn = 33,
    Pheasant = 34,
    CommonWoodPigeon = 35,
    DomesticPigeon = 36,
    EurasianWoodcock = 37,
    HoodedCrow = 38,
    EurasianMagpie = 39,
    BeanGoose = 40,
    GreaterWhiteFrontedGoose = 41,
    CanadaGoose = 42,
    GreylagGoose = 43,
    EurasianCoot = 44,
    EurasianTeal = 45,
    Gadwall = 46,
    NorthernShoveler = 47,
    Mallard = 48,
    Garganey = 49,
    EurasianWigeon = 50,
    NorthernPintail = 51,
    TuftedDuck = 52,
    GreaterScaup = 53,
    CommonScoter = 54,
    CommonGoldeneye = 55,
    Other = 56,
}

export type MainObservationSpecies =
    | SpeciesId.Moose
    | SpeciesId.RedDeer
    | SpeciesId.RoeDeer
    | SpeciesId.WildBoar
    | SpeciesId.Lynx
    | SpeciesId.Wolf
    | SpeciesId.Beaver
    | SpeciesId.EuropeanPineMarten
    | SpeciesId.OtherMammals
    | SpeciesId.Birds;

export enum GenderId {
    Male = 1,
    Female = 2,
    Unspecified = 3,
}

export enum AgeId {
    LessThanOneYear = 1,
    Young = 2,
    MiddleAged = 3,
    Old = 4,
    Unspecified = 5,
}

export enum ObservedSignsId {
    Footprints = 1,
    Excrement = 2,
    LairOrNest = 3,
    Reproduction = 4,
    Other = 5,
}

export enum DeathTypeId {
    HitByAVehicle = 1,
    Died = 2,
    FallenPreyToPredators = 3,
}

export enum SignsOfDiseaseId {
    CoordinationDisordersAlteredGait = 1,
    InadequateReactionToSoundsHumans = 2,
    InjuriesFracturesLameness = 3,
    CoughingSneezing = 4,
    FurSkin = 5,
    SalivationDiarrhoeaDischarge = 6,
}

export enum DamageTypeId {
    AgriculturalLand = 1,
    Forest = 2,
    Infrastructure = 3,
}

export enum AgriculturalLandTypeId {
    Cropping = 1,
    Livestock = 2,
    Beekeeping = 3,
    Poultry = 4,
    Other = 5,
}

export type MainAgriculturalLandType =
    | AgriculturalLandTypeId.Cropping
    | AgriculturalLandTypeId.Livestock
    | AgriculturalLandTypeId.Other;

export enum TreeSpeciesId {
    Pine = 1,
    Other = 2,
    Spruce = 3,
    Birch = 4,
    BlackAlder = 6,
    Aspen = 8,
    WhiteAlder = 9,
    // ... other species without EN translation
}

export enum DamageVolumeTypeId {
    LessThanFivePercent = 1,
    MoreThanFivePercent = 2,
}

export enum ForestDamageTypeId {
    TreetopBittenOffOrBroken = 1,
    TreesGnawed = 2,
    FrayedBark = 3,
    FeedingOnShoots = 4,
    FloodedForestStand = 5,
}

export enum InfrastructureDamageTypeId {
    Road = 1,
    MeliorationSystem = 2,
    Other = 3,
}

export enum HuntedTypeId {
    Hunted = 1,
    Injured = 2,
}

export enum HunterCardTypeId {
    Hunter = 1,
    HuntManager = 2,
    Season = 3,
}

export enum ErrorCode {
    RequestAlreadyProcessed = 5701,
}
