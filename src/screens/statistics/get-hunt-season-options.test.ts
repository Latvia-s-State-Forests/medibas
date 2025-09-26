import { getHuntSeasonOptions } from "~/screens/statistics/get-hunt-season-options";
import { StatisticsSpeciesItem } from "~/types/statistics";

export const mockMultiSeasonData: StatisticsSpeciesItem[] = [
    {
        animalObservationId: 11,
        huntReportId: 111,
        speciesId: 1,
        huntedTime: "2024-01-15T10:30:00Z",
        notes: "Test note 2024-1",
        permitTypeId: 1,
        location: [24.1051, 56.9494],
        huntSeason: "2023-2024",
        strapNumber: "STR011",
        genderId: 1,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: false,
    },
    {
        animalObservationId: 12,
        huntReportId: 112,
        speciesId: 2,
        huntedTime: "2024-01-16T10:30:00Z",
        notes: "Test note 2024-2",
        permitTypeId: 3,
        location: [24.1051, 56.9494],
        huntSeason: "2023-2024",
        genderId: 2,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: true,
    },
    {
        animalObservationId: 13,
        huntReportId: 113,
        speciesId: 3,
        huntedTime: "2025-01-15T10:30:00Z",
        notes: "Test note 2025",
        permitTypeId: 0,
        location: [24.1051, 56.9494],
        huntSeason: "2024-2025",
        genderId: 1,
        ageId: 3,
        count: 3,
        hasSignsOfDisease: false,
    },
];

describe("getHuntSeasonOptions", () => {
    it("should generate unique season options from statistics data", () => {
        const result = getHuntSeasonOptions(mockMultiSeasonData);

        expect(result).toHaveLength(2);
        expect(result).toEqual(
            expect.arrayContaining([
                { label: "2023-2024", value: "2023-2024" },
                { label: "2024-2025", value: "2024-2025" },
            ])
        );
    });

    it("should handle empty statistics data", () => {
        const result = getHuntSeasonOptions([]);
        expect(result).toHaveLength(0);
    });
});
