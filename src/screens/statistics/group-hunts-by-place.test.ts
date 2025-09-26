import { groupHuntsByPlace } from "~/screens/statistics/group-hunts-by-place";
import { SpeciesId } from "~/types/classifiers";
import { HuntedTypeId, HuntPlace } from "~/types/hunts";
import { IndividualHuntStatisticsItem, DrivenHuntStatisticsItem } from "~/types/statistics";

// Mock translation function for tests
function mockT(key: string): string {
    const translations: { [key: string]: string } = {
        "hunt.individualHunt.inTheStation": "Iecirknī",
        "hunt.individualHunt.waterBody": "Ūdenstilpē",
        "hunt.individualHunt.outSideStation": "Ārpus iecirkņa",
    };
    return translations[key] || key;
}

// Extract the type from IndividualHuntStatisticsItem
type HuntedAnimalForStats = IndividualHuntStatisticsItem["huntedAnimals"][number];

function createMockIndividualHunt(
    huntEventPlaceId: number,
    timeSpentInHuntMinutes: number,
    huntedAnimals: HuntedAnimalForStats[] = [],
    huntEventId: number = Math.random()
): IndividualHuntStatisticsItem {
    return {
        huntEventId,
        huntEventPlaceId,
        timeSpentInHuntMinutes,
        huntedAnimals,
        huntEventCode: `HUNT-${huntEventId}`,
        huntSeason: "2024/2025",
        plannedFrom: "2024-01-01T08:00:00Z",
        plannedTo: "2024-01-01T16:00:00Z",
        hunters: [
            {
                id: 1,
                fullName: "Jānis Bērziņš",
                huntersCardNumber: "123456",
            },
        ],
        huntEventTypeId: 1,
        notes: "",
        hasTargetSpecies: false,
        propertyName: "Test Property",
        isSemiAutomaticWeaponUsed: false,
        isNightVisionUsed: false,
        isLightSourceUsed: false,
        isThermalScopeUsed: false,
        meetingPoint: [],
        districts: [],
        dogs: [],
        targetSpecies: [],
    };
}

function createMockDrivenHunt(
    districts: Array<{ id: number; descriptionLv: string }>,
    timeSpentInHuntMinutes: number,
    huntedAnimals: HuntedAnimalForStats[] = [],
    huntEventId: number = Math.random()
): DrivenHuntStatisticsItem {
    return {
        huntEventId,
        timeSpentInHuntMinutes,
        huntedAnimals,
        huntEventCode: `DRIVEN-${huntEventId}`,
        huntSeason: "2024/2025",
        plannedFrom: "2024-01-01T08:00:00Z",
        plannedTo: "2024-01-01T16:00:00Z",
        huntEventTypeId: 2,
        notes: "",
        hasTargetSpecies: false,
        meetingPoint: [],
        districts,
        hunters: [],
        beaters: [],
        guestHunters: [],
        guestBeaters: [],
        dogs: [],
        targetSpecies: [],
        huntManagerName: "Test Manager",
        meetingTime: "2024-01-01T08:00:00Z",
    };
}

describe("groupHuntsByPlace", () => {
    it("should group single individual hunt correctly", () => {
        const hunts = [
            createMockIndividualHunt(HuntPlace.InTheStation, 120, [
                { speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted },
            ]),
        ];
        const result = groupHuntsByPlace(hunts, mockT);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            placeId: HuntPlace.InTheStation,
            totalTime: 120,
            count: 1,
            huntsWithAnimals: 1,
            huntsWithoutAnimals: 0,
            name: "Iecirknī",
            allHunts: expect.arrayContaining([
                expect.objectContaining({
                    huntEventPlaceId: HuntPlace.InTheStation,
                    timeSpentInHuntMinutes: 120,
                }),
            ]),
            huntsWithAnimalsData: expect.arrayContaining([
                expect.objectContaining({
                    huntEventPlaceId: HuntPlace.InTheStation,
                    huntedAnimals: expect.arrayContaining([expect.any(Object)]),
                }),
            ]),
            huntsWithoutAnimalsData: [],
        });
    });
});

it("should group multiple individual hunts at same place", () => {
    const hunts = [
        createMockIndividualHunt(
            HuntPlace.InTheStation,
            120,
            [{ speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted }],
            1
        ),
        createMockIndividualHunt(HuntPlace.InTheStation, 90, [], 2),
        createMockIndividualHunt(
            HuntPlace.InTheStation,
            60,
            [{ speciesId: SpeciesId.RedDeer, strapNumber: "STR002", huntedTypeId: HuntedTypeId.Hunted }],
            3
        ),
    ];
    const result = groupHuntsByPlace(hunts, mockT);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
        placeId: 1,
        totalTime: 270, // 120 + 90 + 60
        count: 3,
        huntsWithAnimals: 2, // first and third hunt
        huntsWithoutAnimals: 1, // second hunt
        name: "Iecirknī",
        allHunts: expect.arrayContaining([
            expect.objectContaining({ huntEventId: 1 }),
            expect.objectContaining({ huntEventId: 2 }),
            expect.objectContaining({ huntEventId: 3 }),
        ]),
        huntsWithAnimalsData: expect.arrayContaining([
            expect.objectContaining({ huntEventId: 1 }),
            expect.objectContaining({ huntEventId: 3 }),
        ]),
        huntsWithoutAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 2 })]),
    });
});

it("should group individual hunts at different places", () => {
    const hunts = [
        createMockIndividualHunt(
            HuntPlace.InTheStation,
            120,
            [{ speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted }],
            1
        ),
        createMockIndividualHunt(HuntPlace.WaterBody, 180, [], 2),
        createMockIndividualHunt(HuntPlace.InTheStation, 60, [], 3),
    ];
    const result = groupHuntsByPlace(hunts, mockT);

    expect(result).toHaveLength(2);

    const place1 = result.find((p) => p.placeId === HuntPlace.InTheStation);
    const place2 = result.find((p) => p.placeId === HuntPlace.WaterBody);

    expect(place1).toEqual({
        placeId: HuntPlace.InTheStation,
        totalTime: 180, // 120 + 60
        count: 2,
        huntsWithAnimals: 1,
        huntsWithoutAnimals: 1,
        name: "Iecirknī",
        allHunts: expect.arrayContaining([
            expect.objectContaining({ huntEventId: 1 }),
            expect.objectContaining({ huntEventId: 3 }),
        ]),
        huntsWithAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
        huntsWithoutAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 3 })]),
    });

    expect(place2).toEqual({
        placeId: HuntPlace.WaterBody,
        totalTime: 180,
        count: 1,
        huntsWithAnimals: 0,
        huntsWithoutAnimals: 1,
        name: "Ūdenstilpē",
        allHunts: expect.arrayContaining([expect.objectContaining({ huntEventId: 2 })]),
        huntsWithAnimalsData: [],
        huntsWithoutAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 2 })]),
    });
});

it("should count individual hunts with animals correctly", () => {
    const hunts = [
        createMockIndividualHunt(HuntPlace.InTheStation, 120, [
            { speciesId: 1, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted },
            { speciesId: 2, strapNumber: "STR002", huntedTypeId: HuntedTypeId.Hunted },
        ]),
    ];
    const result = groupHuntsByPlace(hunts, mockT);

    expect(result[0].huntsWithAnimals).toBe(1);
    expect(result[0].huntsWithoutAnimals).toBe(0);
});

it("should count individual hunts without animals correctly", () => {
    const hunts = [createMockIndividualHunt(HuntPlace.InTheStation, 120, [])];
    const result = groupHuntsByPlace(hunts, mockT);

    expect(result[0].huntsWithAnimals).toBe(0);
    expect(result[0].huntsWithoutAnimals).toBe(1);
});

it("should return empty array for empty input", () => {
    const result = groupHuntsByPlace([], mockT);
    expect(result).toEqual([]);
});

it("should handle empty huntedAnimals array", () => {
    const hunt = createMockIndividualHunt(HuntPlace.InTheStation, 120, []);
    const result = groupHuntsByPlace([hunt], mockT);

    expect(result[0].huntsWithAnimals).toBe(0);
    expect(result[0].huntsWithoutAnimals).toBe(1);
});

it("should handle huntedAnimals with multiple animals", () => {
    const huntedAnimals = [
        { speciesId: 4, strapNumber: "STRAP1", huntedTypeId: 1 },
        { speciesId: 5, strapNumber: "STRAP2", huntedTypeId: 1 },
    ];
    const hunt = createMockIndividualHunt(HuntPlace.InTheStation, 120, huntedAnimals);
    const result = groupHuntsByPlace([hunt], mockT);

    expect(result[0].huntsWithAnimals).toBe(1);
    expect(result[0].huntsWithoutAnimals).toBe(0);
});

it("should sum time correctly for multiple hunts", () => {
    const hunts = [
        createMockIndividualHunt(HuntPlace.InTheStation, 120),
        createMockIndividualHunt(HuntPlace.InTheStation, 90),
        createMockIndividualHunt(HuntPlace.InTheStation, 60),
    ];
    const result = groupHuntsByPlace(hunts, mockT);

    expect(result[0].totalTime).toBe(270);
});

it("should handle zero time hunts", () => {
    const hunts = [
        createMockIndividualHunt(HuntPlace.InTheStation, 0),
        createMockIndividualHunt(HuntPlace.InTheStation, 120),
    ];
    const result = groupHuntsByPlace(hunts, mockT);

    expect(result[0].totalTime).toBe(120);
    expect(result[0].count).toBe(2);
});

it("should maintain count consistency", () => {
    const hunts = [
        createMockIndividualHunt(HuntPlace.InTheStation, 120, [
            { speciesId: SpeciesId.RedDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted },
        ]),
        createMockIndividualHunt(HuntPlace.InTheStation, 90, []),
        createMockIndividualHunt(HuntPlace.WaterBody, 60, [
            { speciesId: SpeciesId.BeanGoose, strapNumber: "", huntedTypeId: HuntedTypeId.Hunted },
        ]),
    ];
    const result = groupHuntsByPlace(hunts, mockT);

    result.forEach((place) => {
        expect(place.huntsWithAnimals + place.huntsWithoutAnimals).toBe(place.count);
    });

    const totalInputHunts = hunts.length;
    const totalOutputCount = result.reduce((sum, place) => sum + place.count, 0);
    expect(totalOutputCount).toBe(totalInputHunts);
});

it("should not mutate input data", () => {
    const hunts = [
        createMockIndividualHunt(HuntPlace.InTheStation, 120, [
            { speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted },
        ]),
    ];
    const originalHunts = JSON.parse(JSON.stringify(hunts));

    groupHuntsByPlace(hunts, mockT);

    expect(hunts).toEqual(originalHunts);
});

describe("groupHuntsByPlace for Driven Hunt", () => {
    it("should group driven hunt with single district", () => {
        const hunts = [
            createMockDrivenHunt(
                [{ id: 1, descriptionLv: "District A" }],
                180,
                [{ speciesId: SpeciesId.WildBoar, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted }],
                1
            ),
        ];
        const result = groupHuntsByPlace(hunts, mockT);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            placeId: 1,
            totalTime: 180,
            count: 1,
            huntsWithAnimals: 1,
            huntsWithoutAnimals: 0,
            name: "District A",
            allHunts: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithoutAnimalsData: [],
        });
    });

    it("should create separate entries for driven hunt with multiple districts", () => {
        const hunts = [
            createMockDrivenHunt(
                [
                    { id: 1, descriptionLv: "District A" },
                    { id: 2, descriptionLv: "District B" },
                    { id: 3, descriptionLv: "District C" },
                ],
                240,
                [{ speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted }],
                1
            ),
        ];
        const result = groupHuntsByPlace(hunts, mockT);

        // Should create 3 separate entries for the same hunt
        expect(result).toHaveLength(3);

        // Each district should have the same hunt data
        const districtA = result.find((r) => r.placeId === 1);
        const districtB = result.find((r) => r.placeId === 2);
        const districtC = result.find((r) => r.placeId === 3);

        expect(districtA).toEqual({
            placeId: 1,
            totalTime: 240,
            count: 1,
            huntsWithAnimals: 1,
            huntsWithoutAnimals: 0,
            name: "District A",
            allHunts: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithoutAnimalsData: [],
        });

        expect(districtB).toEqual({
            placeId: 2,
            totalTime: 240,
            count: 1,
            huntsWithAnimals: 1,
            huntsWithoutAnimals: 0,
            name: "District B",
            allHunts: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithoutAnimalsData: [],
        });

        expect(districtC).toEqual({
            placeId: 3,
            totalTime: 240,
            count: 1,
            huntsWithAnimals: 1,
            huntsWithoutAnimals: 0,
            name: "District C",
            allHunts: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithoutAnimalsData: [],
        });
    });

    it("should aggregate multiple driven hunts in same district", () => {
        const hunts = [
            createMockDrivenHunt(
                [{ id: 1, descriptionLv: "District A" }],
                120,
                [{ speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted }],
                1
            ),
            createMockDrivenHunt([{ id: 1, descriptionLv: "District A" }], 90, [], 2),
            createMockDrivenHunt(
                [{ id: 1, descriptionLv: "District A" }],
                180,
                [{ speciesId: SpeciesId.WildBoar, strapNumber: "STR002", huntedTypeId: HuntedTypeId.Hunted }],
                3
            ),
        ];
        const result = groupHuntsByPlace(hunts, mockT);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            placeId: 1,
            totalTime: 390, // 120 + 90 + 180
            count: 3,
            huntsWithAnimals: 2,
            huntsWithoutAnimals: 1,
            name: "District A",
            allHunts: expect.arrayContaining([
                expect.objectContaining({ huntEventId: 1 }),
                expect.objectContaining({ huntEventId: 2 }),
                expect.objectContaining({ huntEventId: 3 }),
            ]),
            huntsWithAnimalsData: expect.arrayContaining([
                expect.objectContaining({ huntEventId: 1 }),
                expect.objectContaining({ huntEventId: 3 }),
            ]),
            huntsWithoutAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 2 })]),
        });
    });

    it("should handle mixed individual and driven hunts", () => {
        const hunts = [
            createMockIndividualHunt(HuntPlace.InTheStation, 120, [], 1),
            createMockDrivenHunt(
                [{ id: 10, descriptionLv: "District A" }], // Use different ID to avoid collision
                180,
                [{ speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted }],
                2
            ),
            createMockIndividualHunt(
                HuntPlace.WaterBody,
                90,
                [{ speciesId: SpeciesId.WildBoar, strapNumber: "STR002", huntedTypeId: HuntedTypeId.Hunted }],
                3
            ),
        ];
        const result = groupHuntsByPlace(hunts, mockT);

        expect(result).toHaveLength(3);

        const individualStation = result.find((r) => r.placeId === HuntPlace.InTheStation);
        const drivenDistrict = result.find((r) => r.placeId === 10);
        const individualWater = result.find((r) => r.placeId === HuntPlace.WaterBody);

        expect(individualStation?.name).toBe("Iecirknī");
        expect(drivenDistrict?.name).toBe("District A");
        expect(individualWater?.name).toBe("Ūdenstilpē");
    });

    it("should handle driven hunt spanning districts that overlap with other hunts", () => {
        const hunts = [
            // First driven hunt spans District A and B
            createMockDrivenHunt(
                [
                    { id: 1, descriptionLv: "District A" },
                    { id: 2, descriptionLv: "District B" },
                ],
                120,
                [],
                1
            ),
            // Second driven hunt only in District A
            createMockDrivenHunt(
                [{ id: 1, descriptionLv: "District A" }],
                90,
                [{ speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted }],
                2
            ),
        ];
        const result = groupHuntsByPlace(hunts, mockT);

        expect(result).toHaveLength(2);

        const districtA = result.find((r) => r.placeId === 1);
        const districtB = result.find((r) => r.placeId === 2);

        // District A should have both hunts
        expect(districtA).toEqual({
            placeId: 1,
            totalTime: 210, // 120 + 90
            count: 2,
            huntsWithAnimals: 1,
            huntsWithoutAnimals: 1,
            name: "District A",
            allHunts: expect.arrayContaining([
                expect.objectContaining({ huntEventId: 1 }),
                expect.objectContaining({ huntEventId: 2 }),
            ]),
            huntsWithAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 2 })]),
            huntsWithoutAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
        });

        // District B should only have the first hunt
        expect(districtB).toEqual({
            placeId: 2,
            totalTime: 120,
            count: 1,
            huntsWithAnimals: 0,
            huntsWithoutAnimals: 1,
            name: "District B",
            allHunts: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
            huntsWithAnimalsData: [],
            huntsWithoutAnimalsData: expect.arrayContaining([expect.objectContaining({ huntEventId: 1 })]),
        });
    });

    it("should handle empty huntedAnimals array for driven hunt", () => {
        const drivenHunt = createMockDrivenHunt([{ id: 10, descriptionLv: "Driven District" }], 150, []);
        const result = groupHuntsByPlace([drivenHunt], mockT);

        const place = result.find((p) => p.placeId === 10);
        expect(place).toBeDefined();
        if (place) {
            expect(place.huntsWithAnimals).toBe(0);
            expect(place.huntsWithoutAnimals).toBe(1);
        }
    });

    it("should handle huntedAnimals with multiple animals for driven hunt", () => {
        const drivenHunt = createMockDrivenHunt([{ id: 10, descriptionLv: "Driven District" }], 150, [
            { speciesId: SpeciesId.RoeDeer, strapNumber: "STR001", huntedTypeId: HuntedTypeId.Hunted },
            { speciesId: SpeciesId.WildBoar, strapNumber: "STR002", huntedTypeId: HuntedTypeId.Hunted },
        ]);
        const result = groupHuntsByPlace([drivenHunt], mockT);

        const place = result.find((p) => p.placeId === 10);
        expect(place).toBeDefined();
        if (place) {
            expect(place.huntsWithAnimals).toBe(1);
            expect(place.huntsWithoutAnimals).toBe(0);
        }
    });
});
