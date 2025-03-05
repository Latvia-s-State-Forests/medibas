import { LargeIconName } from "~/components/icon";
import { ClassifierOptionDescription } from "~/types/classifiers";
import { PositionResult } from "./position-result";

export interface LimitedSpecies {
    id: number;
    permitTypeId: number;
    icon: LargeIconName;
    description: ClassifierOptionDescription;
    term?: string;
    types?: LimitedSpeciesType[];
    subspecies?: Array<Omit<LimitedSpecies, "subspecies">>;
}

export interface LimitedSpeciesType {
    id: number;
    isDefault?: boolean;
    genders?: LimitedSpeciesGender[];
}

export interface LimitedSpeciesGender {
    id: number;
    isDefault?: boolean;
    ages?: LimitedSpeciesGender[];
}

export interface LimitedSpeciesAge {
    id: number;
    isDefault?: boolean;
}

export interface UnlimitedSpecies {
    id: number;
    icon: LargeIconName;
    description?: ClassifierOptionDescription;
    term?: string;
    subspecies?: Array<{ value: string; label: string }>;
}

export interface LimitedPreyState {
    position?: PositionResult;
    speciesId: number;
    permitId: number;
    type: string;
    gender: string;
    age: string;
    notes: string;
    photo?: string | undefined;
    observedSignsOfDisease: boolean;
    reportId?: number;
    reportGuid: string;
    huntingDistrictId: number;
    hunterCardNumber: string;
    isHunterForeigner: boolean;
    foreignerPermitNumber: string;
}

export interface UnlimitedPreyState {
    position?: PositionResult;
    species: string;
    subspecies: string;
    count: number;
    notes: string;
    photo?: string | undefined;
    observedSignsOfDisease: boolean;
    reportGuid: string;
}
