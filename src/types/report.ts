export enum FeatureLayer {
    DirectlyObservedAnimalsObservation = 1,
    SignsOfPresenceObservation,
    DeadObservation,
    AgriculturalLandDamage,
    ForestDamage,
    InfrastructureDamage,
    UnlimitedHuntReport,
    LimitedHuntReport,
}

export type Geometry = {
    /**
     * Longitude
     */
    x: number;
    /**
     * Latitude
     */
    y: number;
};

export type Feature<T> = {
    geometry: Geometry;
    attributes: T;
};

export type AttributeBase = {
    guid: string;
    reportCreated: string;
};

export type DirectlyObservedAnimalsObservationAttributes = AttributeBase & {
    notes: string;
    speciesId: number;
    genderId: number;
    ageId: number;
    count: number;
    diseaseSignIds: number[];
    diseaseSignNotes: string;
    huntEventId?: number;
    huntEventArea?: number;
};

export type SignsOfPresenceObservationAttributes = AttributeBase & {
    notes: string;
    speciesId: number;
    observedSignIds: number[];
    observedSignNotes: string;
    count: number;
    huntEventId?: number;
    huntEventArea?: number;
};

export type DeadObservationAttributes = AttributeBase & {
    notes: string;
    speciesId: number;
    genderId: number;
    deathTypeId: number;
    ageId: number;
    count: number;
    diseaseSignIds: number[];
    diseaseSignNotes: string;
    huntEventId?: number;
    huntEventArea?: number;
};

export type AgriculturalLandDamageAttributes = AttributeBase & {
    notes: string;
    agriculturalLandTypeId: number;
    speciesId: number;
    otherSpecies: string;
    count?: number;
    damagedArea?: number;
};

export type ForestDamageAttributes = AttributeBase & {
    notes: string;
    damagedArea: number;
    forestProtectionDone: boolean;
    damagedTreeSpeciesIds: number[];
    damageVolumeTypeId: number;
    responsibleAnimalSpeciesId: number;
    otherResponsibleAnimalSpecies: string;
    damageTypeIds: number[];
};

export type InfrastructureDamageAttributes = AttributeBase & {
    notes: string;
    infrastructureTypeId: number;
    otherInfrastructureType: string;
    responsibleAnimalSpeciesId: number;
    otherResponsibleAnimalSpecies: string;
};

export type LimitedHuntReportAttributes = AttributeBase & {
    notes: string;
    speciesId: number;
    huntTypeId: number;
    genderId: number;
    ageId: number;
    permitId: number;
    diseaseSigns: boolean;
    usedDate: string;
    injuredDate?: string;
    reportId?: number;
    reportGuid: string;
    huntingDistrictId: number;
    hunterCardNumber: string;
    isHunterForeigner: boolean;
    foreignerPermitNumber: string;
};

export type UnlimitedHuntReportAttributes = AttributeBase & {
    notes: string;
    speciesId: number;
    diseaseSigns: boolean;
    count: number;
    reportGuid: string;
};

type EditBase<T, U> = {
    id: T;
    adds: [Feature<U>, ...Array<Feature<U>>]; // At least one feature must be available
};

export type EditResponse = {
    id: number;
    error?: EditResponseError;
    strapNumber?: string;
    permitId?: number;
    reportId?: number;
};

export type EditResponseError = {
    code: number;
    message: string;
};

export type Edit =
    | EditBase<FeatureLayer.DirectlyObservedAnimalsObservation, DirectlyObservedAnimalsObservationAttributes>
    | EditBase<FeatureLayer.SignsOfPresenceObservation, SignsOfPresenceObservationAttributes>
    | EditBase<FeatureLayer.DeadObservation, DeadObservationAttributes>
    | EditBase<FeatureLayer.AgriculturalLandDamage, AgriculturalLandDamageAttributes>
    | EditBase<FeatureLayer.ForestDamage, ForestDamageAttributes>
    | EditBase<FeatureLayer.InfrastructureDamage, InfrastructureDamageAttributes>
    | EditBase<FeatureLayer.LimitedHuntReport, LimitedHuntReportAttributes>
    | EditBase<FeatureLayer.UnlimitedHuntReport, UnlimitedHuntReportAttributes>;

export type ReportSyncResult = { reportId: number; permitId?: number; strapNumber?: string };

export type ReportSyncError =
    | { type: "server"; code: number; description: string | undefined } // Server responded with an error code
    | { type: "network" } // Network is unavailable
    | { type: "timeout"; timeout: number } // Request timed out
    | { type: "other" }; // Unknown error

export type Report = {
    id: string;
    createdAt: string;
    edits: [Edit];
    photo?: string;
    inAfricanSwineFeverZone?: boolean;
} & (
    | { status: "pending" | "loading" }
    | { status: "success"; result?: ReportSyncResult }
    | { status: "failure"; error: ReportSyncError }
);
