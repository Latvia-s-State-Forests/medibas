import { configuration } from "~/configuration";
import { groupUnlimitedWithLimitedUnlimited } from "~/screens/statistics/species/species-statistics-group-by-type";
import { SpeciesId } from "~/types/classifiers";
import { LimitedSpecies } from "~/types/hunt";
import mockStatisticsData from "../../../__mocks__/statistics-species.json";
import { mockUnlimitedSpecies } from "./group-unlimited-species-statistics.test";

const UNLIMITED_SPECIES_PERMIT_ID = configuration.statistics.unlimitedSpeciesPermitId;

const mockSpeciesWithPermitTypes: LimitedSpecies[] = [
    {
        id: 3,
        permitTypeId: 0,
        description: { en: "Roe deer", lv: "Stirna", ru: "Косуля" },
        icon: "roe",
        subspecies: [
            {
                id: 3,
                permitTypeId: 8,
                icon: "roe",
                description: { en: "Roe deer (male)", lv: "Stirna (āzis)", ru: "Косуля (самец)" },
                term: "01.06. - 30.11.",
                types: [
                    {
                        id: 1,
                        isDefault: true,
                        genders: [
                            { id: 2, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                            {
                                id: 1,
                                ages: [{ id: 1, isDefault: true }, { id: 2 }, { id: 3 }, { id: 4 }],
                                isDefault: true,
                            },
                        ],
                    },
                    {
                        id: 2,
                        isDefault: false,
                        genders: [
                            { id: 3, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 1 }] },
                            { id: 2, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                            {
                                id: 1,
                                ages: [{ id: 1, isDefault: true }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
                                isDefault: true,
                            },
                        ],
                    },
                ],
            },
            {
                id: 3,
                permitTypeId: 9,
                icon: "roe",
                description: {
                    en: "Roe deer (female or juvenile)",
                    lv: "Stirna (kaza vai kazlēns)",
                    ru: "Косуля (самка или козленок)",
                },
                term: "15.08. - 30.11.",
                types: [
                    {
                        id: 1,
                        isDefault: true,
                        genders: [
                            { id: 1, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                            {
                                id: 2,
                                ages: [{ id: 1, isDefault: true }, { id: 2 }, { id: 3 }, { id: 4 }],
                                isDefault: true,
                            },
                        ],
                    },
                    {
                        id: 2,
                        isDefault: false,
                        genders: [
                            { id: 3, ages: [{ id: 5 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                            { id: 1, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                            {
                                id: 2,
                                ages: [{ id: 1, isDefault: true }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
                                isDefault: true,
                            },
                        ],
                    },
                ],
            },
        ],
        term: "01.06. - 30.11.",
        types: [
            {
                id: 1,
                isDefault: true,
                genders: [
                    { id: 2, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                    { id: 1, ages: [{ id: 1, isDefault: true }, { id: 2 }, { id: 3 }, { id: 4 }], isDefault: true },
                ],
            },
            {
                id: 2,
                isDefault: false,
                genders: [
                    { id: 3, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 1 }] },
                    { id: 2, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                    {
                        id: 1,
                        ages: [{ id: 1, isDefault: true }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
                        isDefault: true,
                    },
                ],
            },
        ],
    },
    {
        id: 4,
        permitTypeId: 10,
        description: { en: "Wild boar", lv: "Mežacūka", ru: "Кабан" },
        icon: "boar",
        types: [
            {
                id: 1,
                isDefault: true,
                genders: [
                    { id: 2, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }] },
                    { id: 1, ages: [{ id: 1 }, { id: 2 }, { id: 3, isDefault: true }, { id: 4 }], isDefault: true },
                ],
            },
            {
                id: 2,
                isDefault: false,
                genders: [
                    { id: 2, ages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 1 }] },
                    { id: 3, ages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }] },
                    {
                        id: 1,
                        ages: [{ id: 1 }, { id: 2 }, { id: 3, isDefault: true }, { id: 4 }, { id: 5 }],
                        isDefault: true,
                    },
                ],
            },
        ],
    },
];

const huntingDataWithMixedSpecies = [
    {
        ...mockStatisticsData[0],
        animalObservationId: 800,
        speciesId: 9,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.1051, 56.9494] as [number, number],
        genderId: 1,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: false,
    },
    {
        ...mockStatisticsData[0],
        animalObservationId: 801,
        speciesId: 9,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.2051, 56.8494] as [number, number],
        genderId: 2,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: true,
    },
    {
        ...mockStatisticsData[0],
        animalObservationId: 802,
        speciesId: 9,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.3051, 56.7494] as [number, number],
        genderId: 1,
        ageId: 3,
        count: 3,
        hasSignsOfDisease: false,
    },
    {
        //Wild boar with specific permit type
        ...mockStatisticsData[0],
        animalObservationId: 803,
        speciesId: 4,
        permitTypeId: 10,
        location: [24.4051, 56.6494] as [number, number],
        genderId: 2,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: true,
    },
    {
        //Fox
        ...mockStatisticsData[0],
        animalObservationId: 804,
        speciesId: 9,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.5051, 56.5494] as [number, number],
        huntedPoint: [24.5051, 56.5494] as [number, number],
        genderId: 1,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: false,
    },
];

const huntingDataOnlyFoxes = [
    {
        ...mockStatisticsData[0],
        animalObservationId: 900,
        speciesId: 9,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.1051, 56.9494] as [number, number],
        huntedPoint: [24.1051, 56.9494] as [number, number],
        genderId: 2,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: true,
    },
    {
        ...mockStatisticsData[0],
        animalObservationId: 901,
        speciesId: 9,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.2051, 56.8494] as [number, number],
        huntedPoint: [24.2051, 56.8494] as [number, number],
        genderId: 1,
        ageId: 3,
        count: 2,
        hasSignsOfDisease: false,
    },
];

describe("groupUnlimitedWithLimitedUnlimited", () => {
    it("creates separate groups for species with different permit types", () => {
        const groups = groupUnlimitedWithLimitedUnlimited(
            huntingDataWithMixedSpecies,
            [...mockUnlimitedSpecies, ...mockSpeciesWithPermitTypes],
            mockSpeciesWithPermitTypes,
            "lv"
        );
        // Wild boar (id: 4) has specific permit type 10 - creates 1 group
        // Fox (id: 9) is plain unlimited species - creates 1 group
        // total 2 groups
        expect(groups).toHaveLength(2);

        // Wild boar group with permitTypeId 10
        const wildBoarGroup = groups.find((g) => g.speciesId === SpeciesId.WildBoar);
        expect(wildBoarGroup?.count).toBe(1);
        expect(wildBoarGroup?.permitTypeId).toBe(10);
        expect(wildBoarGroup?.displayName).toBe("Mežacūka");

        // Fox group (plain unlimited)
        const foxGroup = groups.find((g) => g.speciesId === SpeciesId.Fox);
        expect(foxGroup?.count).toBe(4);
        expect(foxGroup?.permitTypeId).toBe(UNLIMITED_SPECIES_PERMIT_ID);
        expect(foxGroup?.displayName).toBe("Lapsa");
    });

    it("creates fallback group when no specific permit types match", () => {
        const groups = groupUnlimitedWithLimitedUnlimited(
            huntingDataOnlyFoxes,
            [...mockUnlimitedSpecies, ...mockSpeciesWithPermitTypes],
            mockSpeciesWithPermitTypes,
            "lv"
        );
        expect(groups).toHaveLength(1);
        expect(groups[0].speciesId).toBe(9);
        expect(groups[0].count).toBe(2);
        expect(groups[0].permitTypeId).toBe(UNLIMITED_SPECIES_PERMIT_ID); // fallback permitTypeId when no specific match
    });

    it("handles species without subspecies data correctly", () => {
        const groups = groupUnlimitedWithLimitedUnlimited(
            huntingDataWithMixedSpecies,
            [...mockUnlimitedSpecies, ...mockSpeciesWithPermitTypes],
            mockSpeciesWithPermitTypes,
            "lv"
        );
        // Wild boar (id: 4) has permit type 10 that matches the main species permitTypeId, creates 1 group
        // Fox (id: 9) is plain unlimited, so creates 1 group (all 4 entries grouped together)
        // total: 2 groups
        expect(groups).toHaveLength(2);

        const foxGroup = groups.find((g) => g.speciesId === SpeciesId.Fox);
        expect(foxGroup?.count).toBe(4);
        expect(foxGroup?.displayName).toBe("Lapsa");
        expect(foxGroup?.permitTypeId).toBe(UNLIMITED_SPECIES_PERMIT_ID);

        const wildBoarGroup = groups.find((g) => g.speciesId === SpeciesId.WildBoar);
        expect(wildBoarGroup?.count).toBe(1);
        expect(wildBoarGroup?.displayName).toBe("Mežacūka");
        expect(wildBoarGroup?.permitTypeId).toBe(10);
    });
});
