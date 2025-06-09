import { IconName } from "~/components/icon";
import {
    AgeId,
    DamageTypeId,
    DamageVolumeTypeId,
    DeathTypeId,
    GenderId,
    HuntingInfrastructureTypeId,
    InfrastructureDamageTypeId,
    MainAgriculturalLandType,
    MainObservationSpecies,
    ObservationTypeId,
    SpeciesId,
} from "~/types/classifiers";
import { MapService, MapServiceGroup } from "~/types/map";
import { MemberRole } from "~/types/mtl";

interface Option {
    value: string;
    translationKey: string;
}

interface DynamicPicker {
    defaultValue?: string;
    options: Option[];
}

interface Count {
    defaultValue: number;
    min: number;
    max?: number;
}

interface AuthenticationConfiguration {
    failedRefreshCountLimit: number;
}

interface StoreConfiguration {
    ios: string;
    android: string;
}

interface PinConfiguration {
    pinLength: number;
    maxValidationAttemptCount: number;
}

interface SupportConfiguration {
    supportEmail: string;
    termsOfUseUrl: string;
    privacyPolicyUrl: string;
}

interface DamageConfiguration {
    typeIcons: Record<DamageTypeId, IconName<32>>;
    land: {
        typeIcons: Record<MainAgriculturalLandType, IconName<32>>;
        count: Count;
    };
    forest: {
        standProtection: DynamicPicker;
        defaultDamageVolumeType?: DamageVolumeTypeId;
    };
    infrastructure: {
        defaultType?: InfrastructureDamageTypeId;
        defaultResponsibleSpecies?: SpeciesId;
    };
}

interface HuntingInfrastructureConfiguration {
    typeIcons: Record<HuntingInfrastructureTypeId, IconName<32>>;
    daysToKeepChangesFor: number;
}

interface HuntConfiguration {
    count: Count;
    speciesIcons: Record<SpeciesId, IconName<32>>;
    notValidForInjuredSpecies: SpeciesId[];
    plannedSpeciesUsingEquipment: SpeciesId[];
    plannedSpeciesNearWaters: SpeciesId[];
    plannedSpeciesOutsideDistrict: SpeciesId[];
    otherDogSpeciesId: number;
}

export interface MapConfiguration {
    minZoom: number;
    maxZoom: number;
    initialPosition: {
        center: GeoJSON.Position;
        zoom: number;
    };
    bounds: [[number, number], [number, number]];
    serviceGroups: MapServiceGroup[];
    services: MapService[];
}

interface MtlConfiguration {
    memberIcons: Record<MemberRole, IconName<24>>;
    memberRoleSortOrder: Record<MemberRole, number>;
}

interface ObservationsConfiguration {
    typeIcons: Record<ObservationTypeId, IconName<32>>;
    speciesIcons: Record<MainObservationSpecies, IconName<32>>;
    animals: {
        maxCount: number;
        defaultGender?: GenderId;
        defaultAge?: AgeId;
        count: Count;
    };
    signsOfPresence: {
        count: Count;
    };
    deadAnimals: {
        defaultGender?: GenderId;
        defaultDeathType?: DeathTypeId;
        defaultAge?: AgeId;
        count: Count;
    };
    mastArea: {
        min: number;
        max: number;
    };
}

interface ReportsConfiguration {
    /**
     * Days after which the reports will be removed from the list
     */
    daysToKeepEntriesFor: number;

    /**
     * Milliseconds after which the request will be cancelled if not already completed.
     * This behavior can disabled by setting this value to 0. Default value is 30000 (30 seconds).
     */
    timeout: number;
}

interface DistrictDamagesConfiguration {
    /**
     * Days after which the reports will be removed from the list
     */
    daysToKeepEntriesFor: number;
}

interface ReachabilityConfiguration {
    /**
     * URL to ping
     */
    url: string;

    /**
     * HTTP method to use
     */
    method: "GET" | "HEAD";

    /**
     * Expected HTTP status code
     */
    expectedStatus: number;

    /**
     * Milliseconds after which the request will be cancelled if not already completed
     */
    timeout: number;
}

export interface Configuration {
    authentication: AuthenticationConfiguration;
    store: StoreConfiguration;
    pin: PinConfiguration;
    support: SupportConfiguration;
    damage: DamageConfiguration;
    huntingInfrastructure: HuntingInfrastructureConfiguration;
    reports: ReportsConfiguration;
    districtDamages: DistrictDamagesConfiguration;
    hunt: HuntConfiguration;
    map: MapConfiguration;
    mtl: MtlConfiguration;
    observations: ObservationsConfiguration;
    reachability: ReachabilityConfiguration;
}
