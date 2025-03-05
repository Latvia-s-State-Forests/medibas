import { PositionResult } from "./position-result";

export interface AnimalsItemState {
    id: string;
    isCollapsed: boolean;
    gender?: number;
    age?: number;
    count: number;
    observedSignsOfDisease: boolean;
    signsOfDisease: {
        [disease: string]: boolean;
    };
    notesOnDiseases: string;
}

export type AnimalsState = AnimalsItemState[];

export interface DeadAnimalsState {
    gender?: number;
    deathType?: number;
    age?: number;
    count: number;
    observedSignsOfDisease: boolean;
    signsOfDisease: {
        [disease: string]: boolean;
    };
    notesOnDiseases: string;
}

export interface SignsOfPresenceState {
    observedSigns: {
        [sign: string]: boolean;
    };
    observedSignsNotes: string;
    count: number;
}

export interface ObservationsState {
    position?: PositionResult;
    notes: string;
    type?: number;
    species?: number;
    otherMammals?: number;
    birds?: number;
    animals: AnimalsState;
    signsOfPresence: SignsOfPresenceState;
    deadAnimals: DeadAnimalsState;
    photo?: string | undefined;
    huntEventId?: number;
    huntEventArea?: number;
}
