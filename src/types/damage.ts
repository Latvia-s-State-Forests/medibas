import { PositionResult } from "~/types/position-result";

export interface LandDamageState {
    type?: number;
    subtype?: number;
    species?: number;
    customSpecies: string;
    otherSpecies: string;
    area: string;
    count: number;
}

export interface ForestDamageState {
    area: string;
    standProtection: string; // TODO: check whether boolean (checkbox or toggle switch) would be more appropriate
    damagedTreeSpecies: {
        [treeSpecies: string]: boolean;
    };
    otherDamagedTreeSpecies?: number;
    damageVolumeType?: number;
    responsibleSpecies?: number;
    otherResponsibleSpecies: string;
    damageTypes: {
        [type: string]: boolean;
    };
}

export interface InfrastructureDamageState {
    type?: number;
    otherType: string;
    responsibleSpecies?: number;
    otherResponsibleSpecies: string;
}

export interface DamageState {
    position?: PositionResult;
    notes: string;
    type?: number;
    land: LandDamageState;
    forest: ForestDamageState;
    infrastructure: InfrastructureDamageState;
    photo?: string | undefined;
}
