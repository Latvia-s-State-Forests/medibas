import { groupLimitedSpeciesStatistics } from "~/screens/statistics/species/species-statistics-group-by-type";
import { SpeciesId } from "~/types/classifiers";
import { LimitedSpecies } from "~/types/hunt";
import { StatisticsSpeciesItem } from "~/types/statistics";

export const mockLimitedSpecies: LimitedSpecies[] = [
    {
        id: 1,
        permitTypeId: 0,
        description: { lv: "Alnis", en: "Moose", ru: "Лось" },
        icon: "moose",
        subspecies: [
            {
                id: 1,
                permitTypeId: 1,
                icon: "moose",
                description: {
                    en: "Moose (male)",
                    lv: "Alnis (bullis)",
                    ru: "Лось (самец)",
                },
                term: "01.09. - 31.12.",
                types: [],
            },
            {
                id: 1,
                permitTypeId: 2,
                icon: "moose",
                description: {
                    en: "Moose (female)",
                    lv: "Alnis (govs)",
                    ru: "Лось (самка)",
                },
                term: "01.09. - 31.12.",
                types: [],
            },
            {
                id: 1,
                permitTypeId: 3,
                icon: "moose",
                description: {
                    en: "Moose (juvenile)",
                    lv: "Alnis (teļš)",
                    ru: "Лось (теленок)",
                },
                term: "01.09. - 31.12.",
                types: [],
            },
        ],
        term: "01.09. - 31.12.",
        types: [],
    },
    {
        id: 2,
        permitTypeId: 0,
        description: { lv: "Staltbriedis", en: "Red deer", ru: "Благородный олень" },
        icon: "deer",
        subspecies: [
            {
                id: 2,
                permitTypeId: 5,
                icon: "deer",
                description: {
                    en: "Red deer (male)",
                    lv: "Staltbriedis (bullis)",
                    ru: "Благородный олень (самец)",
                },
                term: "01.09. - 15.02.",
                types: [],
            },
        ],
        term: "15.07. - 31.03.",
        types: [],
    },
];

export const mockStatisticsData: StatisticsSpeciesItem[] = [
    {
        animalObservationId: 1,
        huntReportId: 101,
        speciesId: 1,
        huntedTime: "2024-01-15T10:30:00Z",
        notes: "Test note 1",
        permitTypeId: 1,
        location: [24.1051, 56.9494],
        huntSeason: "2023-2024",
        strapNumber: "STR001",
        genderId: 1,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: false,
    },
    {
        animalObservationId: 2,
        huntReportId: 102,
        speciesId: 1,
        huntedTime: "2024-01-16T14:15:00Z",
        notes: "Test note 2",
        permitTypeId: 1,
        location: [24.2051, 56.8494],
        huntSeason: "2023-2024",
        strapNumber: "STR002",
        genderId: 2,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: true,
    },
    {
        animalObservationId: 3,
        huntReportId: 103,
        speciesId: 1,
        huntedTime: "2024-01-17T09:45:00Z",
        notes: "Test note 3",
        permitTypeId: 2,
        location: [24.3051, 56.7494],
        huntSeason: "2023-2024",
        strapNumber: "STR003",
        genderId: 1,
        ageId: 3,
        count: 3,
        hasSignsOfDisease: false,
    },
    {
        animalObservationId: 4,
        huntReportId: 104,
        speciesId: 1,
        huntedTime: "2024-01-18T11:20:00Z",
        notes: "Test note 4",
        permitTypeId: 3,
        location: [24.4051, 56.6494],
        huntSeason: "2023-2024",
        strapNumber: "STR004",
        genderId: 2,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: true,
    },
    {
        animalObservationId: 5,
        huntReportId: 105,
        speciesId: 2,
        huntedTime: "2024-01-19T12:00:00Z",
        notes: "Test note 5",
        permitTypeId: 5,
        location: [24.5051, 56.5494],
        huntSeason: "2023-2024",
        strapNumber: "STR005",
        genderId: 1,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: false,
    },
    //Stirna not limited species
    {
        animalObservationId: 6,
        huntReportId: 106,
        speciesId: 3,
        huntedTime: "2024-01-20T10:45:00Z",
        notes: "Test note 6",
        permitTypeId: 8,
        location: [24.6051, 56.4494],
        huntSeason: "2023-2024",
        strapNumber: "STR006",
        genderId: 2,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: true,
    },
];

describe("groupLimitedSpeciesStatistics", () => {
    it("should group statistics by species and permit type", () => {
        const result = groupLimitedSpeciesStatistics(mockStatisticsData, mockLimitedSpecies, "lv");

        expect(result).toHaveLength(4);

        // Check first group (Alnis bullis - 2 items)
        const mooseMaleGroup = result.find((g) => g.speciesId === SpeciesId.Moose && g.permitTypeId === 1);
        expect(mooseMaleGroup).toBeDefined();
        expect(mooseMaleGroup!.count).toBe(2);
        expect(mooseMaleGroup!.speciesName).toBe("Alnis");
        expect(mooseMaleGroup!.permitTypeName).toBe("Alnis (bullis)");
        expect(mooseMaleGroup!.displayName).toBe("Alnis (bullis)");
        expect(mooseMaleGroup!.items).toHaveLength(2);

        // Check second group (Alnis govs - 1 item)
        const mooseFemaleGroup = result.find((g) => g.speciesId === SpeciesId.Moose && g.permitTypeId === 2);
        expect(mooseFemaleGroup).toBeDefined();
        expect(mooseFemaleGroup!.count).toBe(1);
        expect(mooseFemaleGroup!.speciesName).toBe("Alnis");
        expect(mooseFemaleGroup!.permitTypeName).toBe("Alnis (govs)");
        expect(mooseFemaleGroup!.displayName).toBe("Alnis (govs)");

        // Check third group (Alnis teļš - 1 item)
        const mooseJuvenileGroup = result.find((g) => g.speciesId === SpeciesId.Moose && g.permitTypeId === 3);
        expect(mooseJuvenileGroup).toBeDefined();
        expect(mooseJuvenileGroup!.count).toBe(1);
        expect(mooseJuvenileGroup!.speciesName).toBe("Alnis");
        expect(mooseJuvenileGroup!.permitTypeName).toBe("Alnis (teļš)");
        expect(mooseJuvenileGroup!.displayName).toBe("Alnis (teļš)");

        const roeDeerGroup = result.find((g) => g.speciesId === SpeciesId.RedDeer && g.permitTypeId === 5);
        expect(roeDeerGroup).toBeDefined();
        expect(roeDeerGroup!.count).toBe(1);
        expect(roeDeerGroup!.speciesName).toBe("Staltbriedis");
        expect(roeDeerGroup!.permitTypeName).toBe("Staltbriedis (bullis)");
        expect(roeDeerGroup!.displayName).toBe("Staltbriedis (bullis)");
    });

    it("should filter out items without valid species info", () => {
        const result = groupLimitedSpeciesStatistics(mockStatisticsData, mockLimitedSpecies, "lv");

        // Should still only have 4 groups, invalid species filtered out
        expect(result).toHaveLength(4);
    });

    it("should filter out items without valid permit type info", () => {
        const result = groupLimitedSpeciesStatistics(mockStatisticsData, mockLimitedSpecies, "lv");
        // Should still only have 4 groups, invalid permit type filtered out
        expect(result).toHaveLength(4);
    });

    it("should handle empty statistics data", () => {
        const result = groupLimitedSpeciesStatistics([], mockLimitedSpecies, "lv");
        expect(result).toHaveLength(0);
    });

    it("should handle empty limited species", () => {
        const result = groupLimitedSpeciesStatistics(mockStatisticsData, [], "lv");
        expect(result).toHaveLength(0);
    });

    it("should sort results by permit type name", () => {
        const result = groupLimitedSpeciesStatistics(mockStatisticsData, mockLimitedSpecies, "lv");

        expect(result).toHaveLength(4);
        // Should be sorted alphabetically by permit type name
        expect(result[0].permitTypeName).toBe("Alnis (bullis)");
        expect(result[1].permitTypeName).toBe("Alnis (govs)");
        expect(result[2].permitTypeName).toBe("Alnis (teļš)");
        expect(result[3].permitTypeName).toBe("Staltbriedis (bullis)");
    });

    it("should handle different languages", () => {
        const result = groupLimitedSpeciesStatistics(
            mockStatisticsData.slice(0, 1), // Just one item
            mockLimitedSpecies,
            "en"
        );

        expect(result).toHaveLength(1);
        expect(result[0].speciesName).toBe("Moose");
        expect(result[0].permitTypeName).toBe("Moose (male)");
        expect(result[0].displayName).toBe("Moose (male)");
    });
});
