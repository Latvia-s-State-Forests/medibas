import { addMinutes } from "date-fns";
import { AgriculturalLandTypeId, ClassifierOption, SpeciesClassifierOption } from "~/types/classifiers";
import {
    getAgriculturalLandSpecies,
    getResponsibleSpeciesForForestDamage,
    getResponsibleSpeciesForInfrastructureDamage,
    isOptionActive,
} from "~/utils/filter-classifiers";

describe("getAgriculturalLandSpecies", () => {
    it("should filter expired classifiers", () => {
        const types = (
            Object.values(AgriculturalLandTypeId).filter((t) => !isNaN(Number(t))) as AgriculturalLandTypeId[]
        ).map((t) => t);
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "CROPPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), 5).toISOString(),
                doesDamageCrops: true,
                listOrderDamageCrops: 99,
            },
            {
                id: 2,
                description: { lv: "LIVESTOCK", en: null, ru: null },
                activeFrom: addMinutes(new Date(), 5).toISOString(),
                doesDamageLivestock: true,
            },
            {
                id: 3,
                description: { lv: "POULTRY", en: null, ru: null },
                activeFrom: addMinutes(new Date(), 5).toISOString(),
                doesDamagePoultry: true,
            },
            {
                id: 4,
                description: { lv: "BEEKEEPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), 5).toISOString(),
                doesDamageBees: true,
            },
        ];

        types.forEach((type) => {
            const result = getAgriculturalLandSpecies(options, type);
            expect(result).toEqual([]);
        });
    });

    it("should return classifiers matching AgriculturalLandType.Cropping", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "CROPPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageCrops: true,
            },
        ];
        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Cropping);
        expect(result).toEqual(options);
    });

    it("should return classifiers matching AgriculturalLandType.Livestock", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 2,
                description: { lv: "LIVESTOCK", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageLivestock: true,
            },
        ];
        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Livestock);
        expect(result).toEqual(options);
    });

    it("should return classifiers matching AgriculturalLandType.Poultry", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 3,
                description: { lv: "POULTRY", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamagePoultry: true,
            },
        ];
        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Poultry);
        expect(result).toEqual(options);
    });

    it("should return classifiers matching AgriculturalLandType.Beekeeping", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 4,
                description: { lv: "BEEKEEPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageBees: true,
            },
        ];
        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Beekeeping);
        expect(result).toEqual(options);
    });

    it("should return classifiers matching AgriculturalLandType.Cropping in correct order", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "CROPPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageCrops: true,
                listOrderDamageCrops: 99,
            },
            {
                id: 5,
                description: { lv: "CROPPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageCrops: true,
                listOrderDamageCrops: 1,
            },
        ];
        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Cropping);
        expect(result).toEqual([options[1], options[0]]);
    });

    it("should return classifiers matching AgriculturalLandType.Livestock in correct order", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "LIVESTOCK", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageLivestock: true,
                listOrderDamageLivestock: 99,
            },
            {
                id: 2,
                description: { lv: "LIVESTOCK", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageLivestock: true,
                listOrderDamageLivestock: 1,
            },
        ];
        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Livestock);
        expect(result).toEqual([options[1], options[0]]);
    });
    it("should return classifiers matching AgriculturalLandType.Poultry in correct order", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "POULTRY", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamagePoultry: true,
                listOrderDamagePoultry: 99,
            },
            {
                id: 2,
                description: { lv: "POULTRY", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamagePoultry: true,
                listOrderDamagePoultry: 1,
            },
        ];

        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Poultry);
        expect(result).toEqual([options[1], options[0]]);
    });
    it("should return classifiers matching AgriculturalLandType.Beekeeping in correct order", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "BEEKEEPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageBees: true,
                listOrderDamageBees: 99,
            },
            {
                id: 2,
                description: { lv: "BEEKEEPING", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageBees: true,
                listOrderDamageBees: 1,
            },
        ];
        const result = getAgriculturalLandSpecies(options, AgriculturalLandTypeId.Beekeeping);
        expect(result).toEqual([options[1], options[0]]);
    });
});

describe("getResponsibleSpeciesForForestDamage", () => {
    it("should filter expired classifiers", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "FOREST", en: null, ru: null },
                activeFrom: addMinutes(new Date(), 5).toISOString(),
                doesDamageForest: true,
            },
        ];
        const result = getResponsibleSpeciesForForestDamage(options);
        expect(result).toEqual([]);
    });

    it("should return matching classifiers", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "FOREST", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageForest: true,
            },
        ];
        const result = getResponsibleSpeciesForForestDamage(options);
        expect(result).toEqual(options);
    });

    it("should return classifiers in correct order", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "FOREST", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageForest: true,
                listOrderDamageForest: 99,
            },
            {
                id: 2,
                description: { lv: "FOREST", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageForest: true,
                listOrderDamageForest: 1,
            },
        ];
        const result = getResponsibleSpeciesForForestDamage(options);
        expect(result).toEqual([options[1], options[0]]);
    });
});

describe("getResponsibleSpeciesForInfrastructureDamage", () => {
    it("should filter expired classifiers", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "INFRASTRUCTURE", en: null, ru: null },
                activeFrom: addMinutes(new Date(), 5).toISOString(),
                doesDamageInfrastructure: true,
            },
        ];
        const result = getResponsibleSpeciesForInfrastructureDamage(options);
        expect(result).toEqual([]);
    });

    it("should return matching classifiers", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "INFRASTRUCTURE", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageInfrastructure: true,
            },
        ];
        const result = getResponsibleSpeciesForInfrastructureDamage(options);
        expect(result).toEqual(options);
    });

    it("should return classifiers in correct order", () => {
        const options: SpeciesClassifierOption[] = [
            {
                id: 1,
                description: { lv: "INFRASTRUCTURE", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageInfrastructure: true,
                listOrderDamageInfrastructure: 99,
            },
            {
                id: 2,
                description: { lv: "INFRASTRUCTURE", en: null, ru: null },
                activeFrom: addMinutes(new Date(), -5).toISOString(),
                doesDamageInfrastructure: true,
                listOrderDamageInfrastructure: 1,
            },
        ];
        const result = getResponsibleSpeciesForInfrastructureDamage(options);
        expect(result).toEqual([options[1], options[0]]);
    });
});

describe("isOptionActive", () => {
    const option = {
        activeFrom: addMinutes(new Date(), -5).toISOString(),
        activeTo: addMinutes(new Date(), 5).toISOString(),
    };
    it("returns false if option is expired", () => {
        const result = isOptionActive({
            ...option,
            activeTo: addMinutes(new Date(), -5).toISOString(),
        } as ClassifierOption);

        expect(result).toBe(false);
    });

    it("returns false if option is not active", () => {
        const result = isOptionActive({
            ...option,
            activeFrom: addMinutes(new Date(), 5).toISOString(),
        } as ClassifierOption);
        expect(result).toBe(false);
    });

    it("returns true if option is active", () => {
        const result = isOptionActive({
            ...option,
            activeTo: addMinutes(new Date(), 5).toISOString(),
            activeFrom: addMinutes(new Date(), -5).toISOString(),
        } as ClassifierOption);
        expect(result).toBe(true);
    });
});
