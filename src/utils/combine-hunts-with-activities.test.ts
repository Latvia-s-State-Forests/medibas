import { HuntActivity, HuntActivityType } from "~/types/hunt-activities";
import { Hunt, HuntEventStatus, HuntEventType } from "~/types/hunts";
import { combineHuntsWithActivities } from "./combine-hunts-with-activities";

const mainHunt: Hunt = {
    id: 1,
    vmdCode: "2425-00001",
    huntEventTypeId: HuntEventType.IndividualHunt,
    plannedFrom: "2025-02-11T00:00:00Z",
    plannedTo: "2025-02-11T23:59:59Z",
    huntEventStatusId: HuntEventStatus.Active,
    guid: "3b9db1b5-d36a-483e-a806-1e665830e54f",
    isReducedInfo: false,
    districts: [{ id: 1, descriptionLv: "District 1" }],
    hasTargetSpecies: true,
    targetSpecies: [
        { speciesId: 2, permitTypeId: 5 },
        { speciesId: 2, permitTypeId: 6 },
        { speciesId: 2, permitTypeId: 7 },
        { speciesId: 4 },
    ],
    isSemiAutomaticWeaponUsed: false,
    isLightSourceUsed: false,
    isNightVisionUsed: false,
    isThermalScopeUsed: false,
    hunters: [],
    guestHunters: [],
    beaters: [],
    guestBeaters: [],
    dogs: [],
    districtMembers: [],
    huntedAnimals: [],
};
const mainActivity: HuntActivity = {
    type: HuntActivityType.AddSpeciesAndGear,
    huntId: 1,
    huntCode: "HUNT-123",
    guid: "1cedb9f5-1226-4b5c-82ff-a85e0d53f492",
    date: "2025-02-11T12:00:00Z",
    status: "pending",
    isSemiAutomaticWeaponUsed: true,
    isLightSourceUsed: true,
    isNightVisionUsed: true,
    isThermalScopeUsed: true,
    targetSpecies: [{ speciesId: 9 }, { speciesId: 10 }],
    sentDate: "2025-02-17T07:38:06.899Z",
};
const latestHuntFetchDate = "2025-01-17T08:02:06.789Z";

describe("combineHuntsWithActivities", () => {
    it("should combine hunt with AddSpeciesAndGear activity", () => {
        const result = combineHuntsWithActivities([mainHunt], [mainActivity], latestHuntFetchDate);
        expect(result[0].isSemiAutomaticWeaponUsed).toBe(true);
        expect(result[0].isLightSourceUsed).toBe(true);
        expect(result[0].isNightVisionUsed).toBe(true);
        expect(result[0].isThermalScopeUsed).toBe(true);
        expect(result[0].targetSpecies).toEqual([
            { speciesId: 2, permitTypeId: 5 },
            { speciesId: 2, permitTypeId: 6 },
            { speciesId: 2, permitTypeId: 7 },
            { speciesId: 9 },
            { speciesId: 10 },
        ]);
    });

    it("should skip AddSpeciesAndGear activity if latestHuntFetchDate is newer than sentDate", () => {
        const hunt: Hunt = {
            ...mainHunt,
        };
        const activity: HuntActivity = {
            ...mainActivity,
            sentDate: "2025-01-17T07:38:06.789Z",
        };

        const latestHuntFetchDate = "2025-02-17T08:02:06.789Z";

        const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
        expect(result[0].isSemiAutomaticWeaponUsed).toBe(false);
        expect(result[0].isLightSourceUsed).toBe(false);
        expect(result[0].isNightVisionUsed).toBe(false);
        expect(result[0].isThermalScopeUsed).toBe(false);
        expect(result[0].targetSpecies).toEqual([
            { speciesId: 2, permitTypeId: 5 },
            { speciesId: 2, permitTypeId: 6 },
            { speciesId: 2, permitTypeId: 7 },
            { speciesId: 4 },
        ]);
    });

    it("should not skip AddSpeciesAndGear activity if sentDate is undefined", () => {
        const hunt: Hunt = {
            ...mainHunt,
        };
        const activity: HuntActivity = {
            ...mainActivity,
            sentDate: undefined,
        };

        const latestHuntFetchDate = "2025-02-17T08:02:06.789Z";

        const result = combineHuntsWithActivities([hunt], [activity], latestHuntFetchDate);
        expect(result[0].isSemiAutomaticWeaponUsed).toBe(true);
        expect(result[0].isLightSourceUsed).toBe(true);
        expect(result[0].isNightVisionUsed).toBe(true);
        expect(result[0].isThermalScopeUsed).toBe(true);
        expect(result[0].targetSpecies).toEqual([
            { speciesId: 2, permitTypeId: 5 },
            { speciesId: 2, permitTypeId: 6 },
            { speciesId: 2, permitTypeId: 7 },
            { speciesId: 9 },
            { speciesId: 10 },
        ]);
    });
});
