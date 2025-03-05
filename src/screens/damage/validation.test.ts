import classifiers from "~/__mocks__/classifiers.json";
import {
    getDamageValidationErrors,
    getForestDamageValidationErrors,
    getInfrastructureDamageValidationErrors,
    getLandDamageValidationErrors,
} from "~/screens/damage/validation";
import {
    AgriculturalLandTypeId,
    DamageTypeId,
    DamageVolumeTypeId,
    ForestDamageTypeId,
    InfrastructureDamageTypeId,
    SpeciesId,
    TreeSpeciesId,
} from "~/types/classifiers";
import { DamageState, ForestDamageState, InfrastructureDamageState, LandDamageState } from "~/types/damage";

const position = { latitude: 56.918666, longitude: 24.091752, accuracy: 10 };

const validLandDamageState: LandDamageState = {
    type: AgriculturalLandTypeId.Cropping,
    species: SpeciesId.Moose,
    customSpecies: "",
    otherSpecies: "",
    area: "1.2",
    count: 1,
};

const validForestDamageState: ForestDamageState = {
    area: "123",
    standProtection: "yes",
    damagedTreeSpecies: { [TreeSpeciesId.Pine]: true },
    damageVolumeType: DamageVolumeTypeId.LessThanFivePercent,
    responsibleSpecies: SpeciesId.Moose,
    otherResponsibleSpecies: "",
    damageTypes: { [ForestDamageTypeId.TreetopBittenOffOrBroken]: true },
};

const validInfrastructureDamageState: InfrastructureDamageState = {
    type: InfrastructureDamageTypeId.Road,
    otherType: "",
    responsibleSpecies: SpeciesId.Beaver,
    otherResponsibleSpecies: "",
};

const validDamageState: DamageState = {
    position,
    photo: "...",
    notes: "",
    type: DamageTypeId.AgriculturalLand,
    land: validLandDamageState,
    forest: validForestDamageState,
    infrastructure: validInfrastructureDamageState,
};

describe("getLandDamageValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getLandDamageValidationErrors(validLandDamageState, classifiers);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing type", () => {
        const errors = getLandDamageValidationErrors({ ...validLandDamageState, type: undefined }, classifiers);
        expect(errors).toEqual(['"LIZ tips" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing subtype", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Other,
                subtype: undefined,
            },
            classifiers
        );
        expect(errors).toEqual(['"LIZ apakštips" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing species", () => {
        const errors = getLandDamageValidationErrors({ ...validLandDamageState, species: undefined }, classifiers);
        expect(errors).toEqual(['"Suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing other type's species", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Other,
                subtype: AgriculturalLandTypeId.Beekeeping,
                species: undefined,
            },
            classifiers
        );
        expect(errors).toEqual(['"Suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing customSpecies", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Other,
                subtype: AgriculturalLandTypeId.Other,
                customSpecies: "",
            },
            classifiers
        );
        expect(errors).toEqual(['"Suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing otherSpecies", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Livestock,
                species: SpeciesId.Other,
                otherSpecies: "",
            },
            classifiers
        );
        expect(errors).toEqual(['"Cita suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing area when cropping is selected", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Cropping,
                area: "",
            },
            classifiers
        );
        expect(errors).toEqual(['"Izpostītā platība (ha)" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing custom species when other is selected", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Other,
                subtype: AgriculturalLandTypeId.Other,
                area: "10",
                customSpecies: "",
            },
            classifiers
        );
        expect(errors).toEqual(['"Suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing area when other is selected", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Other,
                subtype: AgriculturalLandTypeId.Other,
                area: "",
                customSpecies: "Some species",
            },
            classifiers
        );
        expect(errors).toEqual(['"Izpostītā platība (ha)" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid count when livestock is selected", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Livestock,
                count: 0,
            },
            classifiers
        );
        expect(errors).toEqual(['"Skaits" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid count when beekeeping is selected", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Beekeeping,
                count: 0,
            },
            classifiers
        );
        expect(errors).toEqual(['"Skaits" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid count when poultry is selected", () => {
        const errors = getLandDamageValidationErrors(
            {
                ...validLandDamageState,
                type: AgriculturalLandTypeId.Poultry,
                count: 0,
            },
            classifiers
        );
        expect(errors).toEqual(['"Skaits" ir obligāti aizpildāms lauks']);
    });
});

describe("getForestDamageValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getForestDamageValidationErrors(validForestDamageState);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing area", () => {
        const errors = getForestDamageValidationErrors({ ...validForestDamageState, area: "" });
        expect(errors).toEqual(['"Aptuveni bojāta platība (ha)" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing standProtection", () => {
        const errors = getForestDamageValidationErrors({ ...validForestDamageState, standProtection: "" });
        expect(errors).toEqual(['"Mežaudzes aizsardzība ir veikta?" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing damageVolumeType", () => {
        const errors = getForestDamageValidationErrors({ ...validForestDamageState, damageVolumeType: undefined });
        expect(errors).toEqual(['"Svaigo bojājumu apjoms mērķa sugas kokiem" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing damagedTreeSpecies", () => {
        const errors = getForestDamageValidationErrors({ ...validForestDamageState, damagedTreeSpecies: {} });
        expect(errors).toEqual(['"Bojātā koku suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing otherDamagedTreeSpecies", () => {
        const errors = getForestDamageValidationErrors({
            ...validForestDamageState,
            damagedTreeSpecies: { [TreeSpeciesId.Other]: true },
            otherDamagedTreeSpecies: undefined,
        });
        expect(errors).toEqual(['"Cita suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing responsibleSpecies", () => {
        const errors = getForestDamageValidationErrors({ ...validForestDamageState, responsibleSpecies: undefined });
        expect(errors).toEqual(['"Bojājumus nodarījušā dzīvnieku suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing otherResponsibleSpecies", () => {
        const errors = getForestDamageValidationErrors({
            ...validForestDamageState,
            responsibleSpecies: SpeciesId.Other,
            otherResponsibleSpecies: "",
        });
        expect(errors).toEqual(['"Cita suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing damageTypes", () => {
        const errors = getForestDamageValidationErrors({ ...validForestDamageState, damageTypes: {} });
        expect(errors).toEqual(['"Bojājuma veids" ir obligāti aizpildāms lauks']);
    });
});

describe("getInfrastructureDamageValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getInfrastructureDamageValidationErrors(validInfrastructureDamageState);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing type", () => {
        const errors = getInfrastructureDamageValidationErrors({ ...validInfrastructureDamageState, type: undefined });
        expect(errors).toEqual(['"Bojājuma tips" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing otherType", () => {
        const errors = getInfrastructureDamageValidationErrors({
            ...validInfrastructureDamageState,
            type: InfrastructureDamageTypeId.Other,
            otherType: "",
        });
        expect(errors).toEqual(['"Cits" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing responsibleSpecies", () => {
        const errors = getInfrastructureDamageValidationErrors({
            ...validInfrastructureDamageState,
            responsibleSpecies: undefined,
        });
        expect(errors).toEqual(['"Bojājumus nodarījušā dzīvnieku suga" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing otherResponsibleSpecies", () => {
        const errors = getInfrastructureDamageValidationErrors({
            ...validInfrastructureDamageState,
            responsibleSpecies: SpeciesId.Other,
            otherResponsibleSpecies: "",
        });
        expect(errors).toEqual(['"Cita suga" ir obligāti aizpildāms lauks']);
    });
});

describe("getDamageValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getDamageValidationErrors(validDamageState, classifiers);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing position", () => {
        const errors = getDamageValidationErrors({ ...validDamageState, position: undefined }, classifiers);
        expect(errors).toEqual(['"Atrašanās vietas koordinātas" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing photo", () => {
        const errors = getDamageValidationErrors({ ...validDamageState, photo: undefined }, classifiers);
        expect(errors).toEqual(['"Fotoattēls" ir obligāti aizpildāms lauks']);
    });

    it("returns an empty array for invalid type", () => {
        const errors = getDamageValidationErrors({ ...validDamageState, type: undefined }, classifiers);
        expect(errors).toEqual([]);
    });

    it("returns an error for invalid land state", () => {
        const errors = getDamageValidationErrors(
            {
                ...validDamageState,
                type: DamageTypeId.AgriculturalLand,
                land: { ...validLandDamageState, type: undefined },
            },
            classifiers
        );
        expect(errors).toEqual(['"LIZ tips" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid forest state", () => {
        const errors = getDamageValidationErrors(
            {
                ...validDamageState,
                type: DamageTypeId.Forest,
                forest: { ...validForestDamageState, area: "" },
            },
            classifiers
        );
        expect(errors).toEqual(['"Aptuveni bojāta platība (ha)" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for invalid infrastructure state", () => {
        const errors = getDamageValidationErrors(
            {
                ...validDamageState,
                type: DamageTypeId.Infrastructure,
                infrastructure: { ...validInfrastructureDamageState, type: undefined },
            },
            classifiers
        );
        expect(errors).toEqual(['"Bojājuma tips" ir obligāti aizpildāms lauks']);
    });
});
