import "~/screens/statistics/species/species-statistics-group-by-type";
import { LimitedSpecies } from "~/types/hunt";
import { StatisticsSpeciesItem } from "~/types/statistics";
import classifiers from "../../../__mocks__/classifiers.json";
import { mockMultiSeasonData } from "../get-hunt-season-options.test";
import {
    filterBirdSpeciesData,
    filterLimitedSpeciesData,
    filterStatisticsBySeason,
    filterUnlimitedSpeciesData,
} from "./filter-statistic-species";
import { mockBirdStatisticsData } from "./group-bird-species-statistics.test";
import { mockLimitedSpecies } from "./group-limited-species-statistics.test";
import { mockUnlimitedSpecies } from "./group-unlimited-species-statistics.test";

const mockStatisticsData: StatisticsSpeciesItem[] = [
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
        speciesId: 2,
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
];

describe("filterLimitedSpeciesData", () => {
    it("should filter data for limited species only", () => {
        const mixedData = [
            ...mockStatisticsData,
            {
                ...mockStatisticsData[0],
                animalObservationId: 999,
                speciesId: 12,
            },
        ];

        const result = filterLimitedSpeciesData(mixedData, mockLimitedSpecies);

        expect(result).toHaveLength(4);
        expect(result.every((item) => [1, 2].includes(item.speciesId))).toBe(true);
    });

    it("should return empty array when no limited species match", () => {
        const dataWithUnlimited = [
            {
                ...mockStatisticsData[0],
                speciesId: 12,
            },
        ];

        const result = filterLimitedSpeciesData(dataWithUnlimited, mockLimitedSpecies);
        expect(result).toHaveLength(0);
    });

    it("should handle empty data", () => {
        const result = filterLimitedSpeciesData([], mockLimitedSpecies);
        expect(result).toHaveLength(0);
    });

    it("should handle empty limited species list", () => {
        const result = filterLimitedSpeciesData(mockStatisticsData, []);
        expect(result).toHaveLength(0);
    });
});

describe("filterBirdSpeciesData", () => {
    it("should filter data for bird species only (subspeciesOfId === 31)", () => {
        const mixedData = [
            ...mockBirdStatisticsData, // Bird species (subspeciesOfId === 31)
            {
                ...mockStatisticsData[0],
                animalObservationId: 999,
                speciesId: 1,
            },
        ];

        const result = filterBirdSpeciesData(mixedData, classifiers);

        expect(result).toHaveLength(3);
        expect(result.every((item) => [32, 33].includes(item.speciesId))).toBe(true);
    });

    it("should return empty array when no bird species match", () => {
        const dataWithNonBirdsOnly = mockStatisticsData;

        const result = filterBirdSpeciesData(dataWithNonBirdsOnly, classifiers);
        expect(result).toHaveLength(0);
    });

    it("should handle undefined classifiers", () => {
        const result = filterBirdSpeciesData(mockBirdStatisticsData, undefined);
        expect(result).toHaveLength(0);
    });

    it("should handle empty data", () => {
        const result = filterBirdSpeciesData([], classifiers);
        expect(result).toHaveLength(0);
    });
});

describe("filterUnlimitedSpeciesData", () => {
    it("should filter data for unlimited and limited-unlimited species", () => {
        const mockLimitedUnlimitedSpecies: LimitedSpecies[] = [
            {
                id: 4,
                permitTypeId: 10,
                description: { lv: "Lapsa", en: "Fox", ru: "Лиса" },
                icon: "animals" as const,
                subspecies: undefined,
                term: undefined,
                types: [],
            },
        ];

        const mixedData = [
            {
                ...mockStatisticsData[0],
                speciesId: 12, // Updated to match mockUnlimitedSpecies (Badger)
            },
            {
                ...mockStatisticsData[0],
                animalObservationId: 998,
                speciesId: 4, // Limited-unlimited species
            },
            {
                ...mockStatisticsData[0],
                animalObservationId: 999,
                speciesId: 1, // Limited species (should not be included)
            },
        ];

        const result = filterUnlimitedSpeciesData(mixedData, mockUnlimitedSpecies, mockLimitedUnlimitedSpecies);

        expect(result).toHaveLength(2);
        expect(result.every((item) => [12, 4].includes(item.speciesId))).toBe(true);
    });

    it("should return empty array when no unlimited species match", () => {
        const dataWithLimitedOnly = [
            {
                ...mockStatisticsData[0],
                speciesId: 1,
            },
        ];

        const result = filterUnlimitedSpeciesData(dataWithLimitedOnly, mockUnlimitedSpecies, []);
        expect(result).toHaveLength(0);
    });

    it("should handle empty data", () => {
        const result = filterUnlimitedSpeciesData([], mockUnlimitedSpecies, []);
        expect(result).toHaveLength(0);
    });

    it("should handle empty species lists", () => {
        const data = [
            {
                ...mockStatisticsData[0],
                speciesId: 12,
            },
        ];

        const result = filterUnlimitedSpeciesData(data, [], []);
        expect(result).toHaveLength(0);
    });
});

describe("filterStatisticsBySeason", () => {
    it("should filter statistics by selected season", () => {
        const result = filterStatisticsBySeason(mockMultiSeasonData, "2023-2024");

        expect(result).toHaveLength(2);
        expect(result.every((item) => item.huntSeason === "2023-2024")).toBe(true);
    });

    it("should return empty array when no items match season", () => {
        const result = filterStatisticsBySeason(mockMultiSeasonData, "2025-2026");
        expect(result).toHaveLength(0);
    });

    it("should handle empty data", () => {
        const result = filterStatisticsBySeason([], "2023-2024");
        expect(result).toHaveLength(0);
    });
});
