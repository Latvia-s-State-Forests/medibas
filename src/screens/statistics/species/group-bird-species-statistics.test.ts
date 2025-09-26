import { groupBirdSpeciesStatistics } from "~/screens/statistics/species/species-statistics-group-by-type";
import { SpeciesId } from "~/types/classifiers";
import { StatisticsSpeciesItem } from "~/types/statistics";
import classifiers from "../../../__mocks__/classifiers.json";

export const mockBirdStatisticsData: StatisticsSpeciesItem[] = [
    {
        animalObservationId: 5,
        huntReportId: 105,
        speciesId: 32,
        huntedTime: "2024-01-19T09:30:00Z",
        notes: "Bird hunting note",
        permitTypeId: 99,
        location: [24.5051, 56.5494],
        huntSeason: "2023-2024",
        genderId: 1,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: false,
    },
    {
        animalObservationId: 6,
        huntReportId: 106,
        speciesId: 33,
        huntedTime: "2024-01-20T10:45:00Z",
        notes: "Another bird hunting note",
        permitTypeId: 99,
        location: [24.6051, 56.4494],
        huntSeason: "2023-2024",
        genderId: 2,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: true,
    },
    {
        animalObservationId: 5,
        huntReportId: 199,
        speciesId: 32,
        huntedTime: "2024-01-19T09:30:00Z",
        notes: "Bird hunting note",
        permitTypeId: 99,
        location: [24.5051, 56.5494],
        huntSeason: "2023-2024",
        genderId: 1,
        ageId: 3,
        count: 3,
        hasSignsOfDisease: false,
    },
];

describe("groupBirdSpeciesStatistics", () => {
    it("should group bird species statistics by species only", () => {
        const result = groupBirdSpeciesStatistics(mockBirdStatisticsData, classifiers, "lv");

        expect(result).toHaveLength(2);

        const hazelGroup = result.find((g) => g.speciesId === SpeciesId.HazelGrouse);
        expect(hazelGroup).toBeDefined();
        expect(hazelGroup!.count).toBe(2);
        expect(hazelGroup!.speciesName).toBe("Mežirbe");
        expect(hazelGroup!.items).toHaveLength(2);

        const rackelhahn = result.find((g) => g.speciesId === SpeciesId.Rackelhahn);
        expect(rackelhahn).toBeDefined();
        expect(rackelhahn!.count).toBe(1);
        expect(rackelhahn!.speciesName).toBe("Raķelis");
        expect(rackelhahn!.items).toHaveLength(1);
    });

    it("should filter out non-bird species (subspeciesOfId !== SpeciesId.Birds)", () => {
        const onlyBirdData = mockBirdStatisticsData; // Only birds should be passed to the function

        const result = groupBirdSpeciesStatistics(onlyBirdData, classifiers, "lv");

        // Should only include the bird species passed to it
        expect(result).toHaveLength(2);
        expect(result.find((g) => g.speciesId === SpeciesId.HazelGrouse)).toBeDefined();
        expect(result.find((g) => g.speciesId === SpeciesId.Rackelhahn)).toBeDefined();
        expect(result.find((g) => g.speciesId === SpeciesId.Moose)).toBeUndefined(); // Moose not included
    });

    it("should handle empty data", () => {
        const result = groupBirdSpeciesStatistics([], classifiers, "lv");
        expect(result).toHaveLength(0);
    });

    it("should handle undefined classifiers", () => {
        const result = groupBirdSpeciesStatistics(mockBirdStatisticsData, undefined, "lv");
        expect(result).toHaveLength(0);
    });

    it("should sort results alphabetically by species name", () => {
        const result = groupBirdSpeciesStatistics(mockBirdStatisticsData, classifiers, "lv");

        expect(result).toHaveLength(2);
        expect(result[0].speciesName).toBe("Mežirbe");
        expect(result[1].speciesName).toBe("Raķelis");
    });

    it("should handle different languages", () => {
        const result = groupBirdSpeciesStatistics(mockBirdStatisticsData, classifiers, "en");

        expect(result).toHaveLength(2);
        const duckGroup = result.find((g) => g.speciesId === SpeciesId.HazelGrouse);
        expect(duckGroup!.speciesName).toBe("Hazel grouse");
    });
});
