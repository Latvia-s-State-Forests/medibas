import { configuration } from "~/configuration";
import { groupUnlimitedSpeciesStatistics } from "~/screens/statistics/species/species-statistics-group-by-type";
import { SpeciesId } from "~/types/classifiers";
import { UnlimitedSpecies } from "~/types/hunt";
import importedMockStatisticsData from "../../../__mocks__/statistics-species.json";

const UNLIMITED_SPECIES_PERMIT_ID = configuration.statistics.unlimitedSpeciesPermitId;

export const mockUnlimitedSpecies: UnlimitedSpecies[] = [
    { id: 9, description: { en: "Fox", lv: "Lapsa", ru: "Лиса" }, icon: "fox" },
    { id: 10, description: { en: "Raccoon dog", lv: "Jenotsuns", ru: "Енотовидная собака" }, icon: "racoon" },
    { id: 11, description: { en: "Beaver", lv: "Bebrs", ru: "Бобр" }, icon: "beaver", term: "15.07. - 30.04." },
    { id: 12, description: { en: "Badger", lv: "Āpsis", ru: "Барсук" }, icon: "badger", term: "01.08. - 31.03." },
    {
        id: 13,
        description: { en: "Hare", lv: "Zaķis", ru: "Заяц" },
        icon: "hare",
        subspecies: [
            { value: "14", label: "Pelēkais zaķis" },
            { value: "15", label: "Baltais zaķis" },
        ],
        term: "01.10. - 31.01.",
    },
    {
        id: 16,
        description: { en: "Marten", lv: "Cauna", ru: "Куница" },
        icon: "marten",
        subspecies: [
            { value: "17", label: "Meža cauna" },
            { value: "18", label: "Akmens cauna" },
        ],
        term: "01.10. - 31.03.",
    },
    { id: 19, description: { en: "Polecat", lv: "Sesks", ru: "Хорек" }, icon: "polecat", term: "01.10. - 31.03." },
    {
        id: 30,
        description: { en: "Other mammals", lv: "Citi zīdītāji", ru: "Прочие млекопитающие" },
        icon: "racoon",
        subspecies: [
            { value: "20", label: "Amerikas ūdele" },
            { value: "27", label: "Baibaks" },
            { value: "23", label: "Dambriedis" },
            { value: "21", label: "Jenots" },
            { value: "24", label: "Muflons" },
            { value: "26", label: "Nutrija" },
            { value: "22", label: "Ondatra" },
            { value: "25", label: "Sika briedis" },
            { value: "28", label: "Zeltainais šakālis" },
        ],
    },
    {
        id: 31,
        description: { en: "Birds", lv: "Putni", ru: "Птицы" },
        icon: "birds",
        subspecies: [
            { value: "41", label: "Baltpieres zoss" },
            { value: "50", label: "Baltvēderis" },
            { value: "52", label: "Cekulpīle" },
            { value: "34", label: "Fazāns" },
            { value: "55", label: "Gaigala" },
            { value: "51", label: "Garkaklis" },
            { value: "42", label: "Kanādas zoss" },
            { value: "53", label: "Ķerra" },
            { value: "45", label: "Krīklis" },
            { value: "44", label: "Laucis" },
            { value: "35", label: "Lauku balodis" },
            { value: "36", label: "Mājas balodis" },
            { value: "54", label: "Melnā pīle" },
            { value: "48", label: "Meža pīle" },
            { value: "43", label: "Meža zoss" },
            { value: "32", label: "Mežirbe" },
            { value: "46", label: "Pelēkā pīle" },
            { value: "38", label: "Pelēkā vārna" },
            { value: "47", label: "Platknābis" },
            { value: "49", label: "Prīkšķe" },
            { value: "33", label: "Raķelis" },
            { value: "40", label: "Sējas zoss" },
            { value: "37", label: "Sloka" },
            { value: "39", label: "Žagata" },
        ],
        term: "15.06. - 31.12.",
    },
];

const mockStatisticsData = [
    {
        ...importedMockStatisticsData[0],
        animalObservationId: 100,
        speciesId: 12,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.1051, 56.9494] as [number, number],
        huntedPoint: [24.1051, 56.9494] as [number, number],
        genderId: 1,
        ageId: 2,
        count: 1,
        hasSignsOfDisease: false,
    },
    {
        ...importedMockStatisticsData[1],
        animalObservationId: 101,
        speciesId: 12,
        permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
        location: [24.2051, 56.8494] as [number, number],
        huntedPoint: [24.2051, 56.8494] as [number, number],
        genderId: 2,
        ageId: 1,
        count: 2,
        hasSignsOfDisease: true,
    },
];

describe("groupUnlimitedSpeciesStatistics", () => {
    it("should group unlimited species statistics by species only", () => {
        const result = groupUnlimitedSpeciesStatistics(mockStatisticsData, mockUnlimitedSpecies, "lv");

        expect(result).toHaveLength(1);
        expect(result[0].speciesId).toBe(12);
        expect(result[0].count).toBe(2);
        expect(result[0].speciesName).toBe("Āpsis");
        expect(result[0].displayName).toBe("Āpsis");
        expect(result[0].items).toHaveLength(2);
    });

    it("should handle mixed unlimited species", () => {
        const mixedData = [
            // Badger entry
            {
                ...importedMockStatisticsData[0],
                animalObservationId: 102,
                speciesId: 12,
                permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
                location: [24.3051, 56.7494] as [number, number],
                huntedPoint: [24.3051, 56.7494] as [number, number],
                genderId: 1,
                ageId: 2,
                count: 1,
                hasSignsOfDisease: false,
            },
            {
                ...importedMockStatisticsData[2],
                animalObservationId: 104,
                speciesId: 12,
                permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
                location: [24.3051, 56.7494] as [number, number],
                huntedPoint: [24.3051, 56.7494] as [number, number],
                genderId: 2,
                ageId: 1,
                count: 2,
                hasSignsOfDisease: true,
            },
            // Fox entry
            {
                ...importedMockStatisticsData[1],
                animalObservationId: 103,
                speciesId: 9,
                permitTypeId: UNLIMITED_SPECIES_PERMIT_ID,
                location: [24.3051, 56.7494] as [number, number],
                huntedPoint: [24.3051, 56.7494] as [number, number],
                genderId: 1,
                ageId: 2,
                count: 1,
                hasSignsOfDisease: false,
            },
        ];

        const result = groupUnlimitedSpeciesStatistics(mixedData, mockUnlimitedSpecies, "lv");

        expect(result).toHaveLength(2);

        const badgerGroup = result.find((g) => g.speciesId === SpeciesId.Badger);
        expect(badgerGroup!.count).toBe(2);

        const foxGroup = result.find((g) => g.speciesId === SpeciesId.Fox);
        expect(foxGroup!.count).toBe(1);
    });

    it("should filter out species not in the provided species list", () => {
        const dataWithUnknownSpecies = [
            ...mockStatisticsData,
            {
                ...mockStatisticsData[0],
                animalObservationId: 999,
                speciesId: 999, // Unknown species
                location: [24.4051, 56.6494] as [number, number],
                huntedPoint: [24.4051, 56.6494] as [number, number],
            },
        ];

        const result = groupUnlimitedSpeciesStatistics(dataWithUnknownSpecies, mockUnlimitedSpecies, "lv");

        // Should only have the known species
        expect(result).toHaveLength(1);
        expect(result[0].speciesId).toBe(12); // Updated speciesId
    });

    it("should handle empty data", () => {
        const result = groupUnlimitedSpeciesStatistics([], mockUnlimitedSpecies, "lv");
        expect(result).toHaveLength(0);
    });

    it("should handle empty species list", () => {
        const result = groupUnlimitedSpeciesStatistics(mockStatisticsData, [], "lv");
        expect(result).toHaveLength(0);
    });

    it("should sort results alphabetically by species name", () => {
        const multipleSpeciesData = [
            {
                ...mockStatisticsData[0],
                animalObservationId: 100,
                speciesId: 12,
                location: [24.1051, 56.9494] as [number, number],
                huntedPoint: [24.1051, 56.9494] as [number, number],
            },
            {
                ...mockStatisticsData[1],
                animalObservationId: 101,
                speciesId: 4,
                location: [24.2051, 56.8494] as [number, number],
                huntedPoint: [24.2051, 56.8494] as [number, number],
            },
        ];

        const multipleSpecies = [
            {
                id: 4,
                description: { lv: "Lapsa", en: "Fox", ru: "Лиса" },
                icon: "animals" as const,
                subspecies: undefined,
                term: undefined,
            },
            {
                id: 12,
                description: { lv: "Āpsis", en: "Badger", ru: "Барсук" },
                icon: "animals" as const,
                subspecies: undefined,
                term: undefined,
            },
        ];

        const result = groupUnlimitedSpeciesStatistics(multipleSpeciesData, multipleSpecies, "lv");

        expect(result).toHaveLength(2);
        expect(result[0].speciesName).toBe("Āpsis");
        expect(result[1].speciesName).toBe("Lapsa");
    });

    it("should handle different languages", () => {
        const result = groupUnlimitedSpeciesStatistics(mockStatisticsData, mockUnlimitedSpecies, "en");

        expect(result).toHaveLength(1);
        expect(result[0].speciesName).toBe("Badger");
        expect(result[0].displayName).toBe("Badger");
    });
});
