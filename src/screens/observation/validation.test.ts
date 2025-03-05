import {
    AgeId,
    DeathTypeId,
    GenderId,
    ObservationTypeId,
    ObservedSignsId,
    SignsOfDiseaseId,
    SpeciesId,
} from "~/types/classifiers";
import { AnimalsState, DeadAnimalsState, ObservationsState, SignsOfPresenceState } from "~/types/observations";
import { PositionResult } from "~/types/position-result";
import {
    getAnimalsValidationErrors,
    getDeadAnimalsValidationErrors,
    getObservationsValidationErrors,
    getSignsOfPresenceValidationErrors,
} from "./validation";

const position: PositionResult = { latitude: 56.918666, longitude: 24.091752, accuracy: 10 };

const validAnimalsState: AnimalsState = [
    {
        id: "0c16c483-2878-4988-9703-abf1e76509d1",
        gender: GenderId.Male,
        age: AgeId.LessThanOneYear,
        count: 1,
        observedSignsOfDisease: true,
        signsOfDisease: {
            [SignsOfDiseaseId.CoordinationDisordersAlteredGait]: true,
        },
        notesOnDiseases: "Something something",
        isCollapsed: false,
    },
];

const validSignsOfPresenceState: SignsOfPresenceState = {
    observedSigns: {
        [ObservedSignsId.Excrement]: true,
    },
    observedSignsNotes: "",
    count: 1,
};

const validDeadAnimalsState: DeadAnimalsState = {
    gender: GenderId.Male,
    deathType: DeathTypeId.HitByAVehicle,
    age: AgeId.LessThanOneYear,
    count: 1,
    observedSignsOfDisease: true,
    signsOfDisease: {
        [SignsOfDiseaseId.CoordinationDisordersAlteredGait]: true,
    },
    notesOnDiseases: "Something something",
};

const validObservationsState: ObservationsState = {
    position,
    photo: "...",
    notes: "",
    type: ObservationTypeId.DirectlyObservedAnimals,
    species: SpeciesId.Moose,
    animals: validAnimalsState,
    signsOfPresence: validSignsOfPresenceState,
    deadAnimals: validDeadAnimalsState,
};

describe("getAnimalsValidationErrors", () => {
    it("returns an empty array for valid state without signsOfDisease", () => {
        const errors = getAnimalsValidationErrors(validAnimalsState);
        expect(errors).toEqual([]);
    });

    it("returns an empty array for valid state without signsOfDisease", () => {
        const errors = getAnimalsValidationErrors([{ ...validAnimalsState[0], observedSignsOfDisease: false }]);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing gender", () => {
        const errors = getAnimalsValidationErrors([{ ...validAnimalsState[0], gender: undefined }]);
        expect(errors).toEqual(['"Dzimums" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing age", () => {
        const errors = getAnimalsValidationErrors([{ ...validAnimalsState[0], age: undefined }]);
        expect(errors).toEqual(['"Vecums" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing count", () => {
        const errors = getAnimalsValidationErrors([{ ...validAnimalsState[0], count: 0 }]);
        expect(errors).toEqual(['"Skaits" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing signsOfDisease", () => {
        const errors = getAnimalsValidationErrors([
            { ...validAnimalsState[0], observedSignsOfDisease: true, signsOfDisease: {} },
        ]);
        expect(errors).toEqual(['"Slimības pazīmes" ir obligāti aizpildāms lauks']);
    });
});

describe("getSignsOfPresenceValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getSignsOfPresenceValidationErrors(validSignsOfPresenceState);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing observedSigns", () => {
        const errors = getSignsOfPresenceValidationErrors({ ...validSignsOfPresenceState, observedSigns: {} });
        expect(errors).toEqual(['"Novērotas pazīmes" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing observedSignsNotes", () => {
        const errors = getSignsOfPresenceValidationErrors({
            ...validSignsOfPresenceState,
            observedSigns: { [ObservedSignsId.Other]: true },
            observedSignsNotes: "",
        });
        expect(errors).toEqual(['"Citas pazīmes" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing count", () => {
        const errors = getSignsOfPresenceValidationErrors({ ...validSignsOfPresenceState, count: 0 });
        expect(errors).toEqual(['"Skaits" ir obligāti aizpildāms lauks']);
    });
});

describe("getDeadAnimalsValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getDeadAnimalsValidationErrors(validDeadAnimalsState);
        expect(errors).toEqual([]);
    });

    it("returns an empty array for valid state without signsOfDisease", () => {
        const errors = getDeadAnimalsValidationErrors({ ...validDeadAnimalsState, observedSignsOfDisease: false });
        expect(errors).toEqual([]);
    });

    it("returns an error for missing gender", () => {
        const errors = getDeadAnimalsValidationErrors({ ...validDeadAnimalsState, gender: undefined });
        expect(errors).toEqual(['"Dzimums" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing deathType", () => {
        const errors = getDeadAnimalsValidationErrors({ ...validDeadAnimalsState, deathType: undefined });
        expect(errors).toEqual(['"Bojāejas veids" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing age", () => {
        const errors = getDeadAnimalsValidationErrors({ ...validDeadAnimalsState, age: undefined });
        expect(errors).toEqual(['"Vecums" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing count", () => {
        const errors = getDeadAnimalsValidationErrors({ ...validDeadAnimalsState, count: 0 });
        expect(errors).toEqual(['"Skaits" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing signsOfDisease", () => {
        const errors = getDeadAnimalsValidationErrors({
            ...validDeadAnimalsState,
            observedSignsOfDisease: true,
            signsOfDisease: {},
        });
        expect(errors).toEqual(['"Novērotas pazīmes" ir obligāti aizpildāms lauks']);
    });
});

describe("getObservationsValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getObservationsValidationErrors(validObservationsState);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing mast area", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            huntEventId: 1,
            huntEventArea: undefined,
        });
        expect(errors).toEqual(['"Masta platība (ha)" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for mast area being less than the minimum", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            huntEventId: 1,
            huntEventArea: 0,
        });
        expect(errors).toEqual(['"Masta platība (ha)" vērtība nevar būt mazāka par 1']);
    });

    it("returns an error for mast area being greater than the maximum", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            huntEventId: 1,
            huntEventArea: 1000,
        });
        expect(errors).toEqual(['"Masta platība (ha)" vērtība nevar būt lielāka par 999']);
    });

    it("returns an error for missing species", () => {
        const errors = getObservationsValidationErrors({ ...validObservationsState, species: undefined });
        expect(errors).toEqual(['"Sugas (pamatgrupa)" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing otherMammals", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            species: SpeciesId.OtherMammals,
            otherMammals: undefined,
        });
        expect(errors).toEqual(['"Citi zīdītāji" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing birds", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            species: SpeciesId.Birds,
            birds: undefined,
        });
        expect(errors).toEqual(['"Putni" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid animals state", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            animals: [{ ...validAnimalsState[0], gender: undefined }],
        });
        expect(errors).toEqual(['"Dzimums" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid signsOfPresence state", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            type: ObservationTypeId.SignsOfPresence,
            signsOfPresence: { ...validSignsOfPresenceState, observedSigns: {} },
        });
        expect(errors).toEqual(['"Novērotas pazīmes" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid deadAnimals state", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            type: ObservationTypeId.Dead,
            deadAnimals: { ...validDeadAnimalsState, gender: undefined },
        });
        expect(errors).toEqual(['"Dzimums" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing position", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            position: undefined,
        });
        expect(errors).toEqual(['"Atrašanās vietas koordinātas" ir obligāti aizpildāms lauks']);
    });

    it("returns an empty array for missing photo - directly observed animals", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
        });
        expect(errors).toEqual([]);
    });

    it("returns an error for missing photo - signs of presence", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            type: ObservationTypeId.SignsOfPresence,
            signsOfPresence: validSignsOfPresenceState,
            photo: undefined,
        });
        expect(errors).toEqual(['"Fotoattēls" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing photo - dead animals", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            type: ObservationTypeId.Dead,
            deadAnimals: validDeadAnimalsState,
            photo: undefined,
        });
        expect(errors).toEqual(['"Fotoattēls" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing type", () => {
        const errors = getObservationsValidationErrors({
            ...validObservationsState,
            type: undefined,
        });
        expect(errors).toEqual(['"Veids" ir obligāti aizpildāms lauks']);
    });
});
