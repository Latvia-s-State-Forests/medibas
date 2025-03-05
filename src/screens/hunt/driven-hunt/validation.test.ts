import { Hunt, HuntEventStatus } from "~/types/hunts";
import { DrivenHuntFormState } from "./driven-hunt-form-state";
import { getDrivenHuntManagementErrors, getSubmitDrivenHuntValidationErrors } from "./validation";

const submitDrivenHunt: DrivenHuntFormState = {
    huntManagerPersonId: 1,
    selectedPosition: [0, 0],
    districts: [1, 2],
    notesValue: "Some notes",
    huntAllSpecies: false,
    targetSpecies: [],
    date: new Date(),
    time: new Date(),
    dogs: [],
    hunters: [
        {
            guid: "string1",
            personId: 1,
            fullName: "Jānis Bērziņš",
            huntersCardNumber: "MED1111",
            statusId: HuntEventStatus.Scheduled,
        },
        {
            guid: "string2",
            personId: 2,
            fullName: "Jānis Kalniņš",
            huntersCardNumber: "MED2222",
            statusId: HuntEventStatus.Scheduled,
        },
    ],
    guestHunters: [
        {
            guid: "string3",
            fullName: "Andrew Silver",
            guestHuntersCardNumber: "MED3333",
            statusId: HuntEventStatus.Scheduled,
        },
    ],
    beaters: [],
    guestBeaters: [],
};

const validHunt: Hunt = {
    id: 2,
    canUserEdit: true,
    vmdCode: "",
    qrCode: "",
    huntEventTypeId: 2,
    huntManagerPersonId: 12,
    plannedFrom: new Date().toISOString(),
    plannedTo: "",
    meetingTime: "string",
    huntEventStatusId: 1,
    meetingPointX: 0,
    meetingPointY: 0,
    notes: "string",
    isReducedInfo: false,
    guid: "",
    hasTargetSpecies: true,
    districts: [
        {
            id: 4,
            descriptionLv: "Purva medību iecirknis",
        },
    ],
    hunters: [
        {
            id: 1,
            guid: "someString",
            personId: 1,
            fullName: "Jānis Bērziņš",
            huntersCardNumber: "MED1234",
            statusId: 1,
        },
        {
            id: 2,
            guid: "someString",
            personId: 2,
            fullName: "Jānis Kalniņš",
            huntersCardNumber: "MED5678",
            statusId: 1,
        },
    ],
    beaters: [],
    guestHunters: [],
    guestBeaters: [],
    targetSpecies: [{ speciesId: 1, permitTypeId: 1 }],
    dogs: [],
    huntedAnimals: [],
};

describe("getSubmitDrivenHuntValidationErrors", () => {
    it("returns an empty array for valid hunt", () => {
        const errors = getSubmitDrivenHuntValidationErrors(submitDrivenHunt);
        expect(errors).toEqual([]);
    });

    it("if checkedDistricts is empty, returns an error", () => {
        const errors = getSubmitDrivenHuntValidationErrors({ ...submitDrivenHunt, districts: [] });
        expect(errors).toEqual(['"Iecirknis" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing date", () => {
        const errors = getSubmitDrivenHuntValidationErrors({ ...submitDrivenHunt, date: undefined });
        expect(errors).toEqual(['"Medību datums" ir obligāti aizpildāms lauks']);
    });
});

describe("getDrivenHuntManagementErrors", () => {
    it("returns an empty array for valid hunt", () => {
        const errors = getDrivenHuntManagementErrors(validHunt);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing districts", () => {
        const errors = getDrivenHuntManagementErrors({ ...validHunt, districts: [] });
        expect(errors).toEqual(['"Iecirknis" ir obligāti aizpildāms lauks']);
    });

    it("returns an error for missing huntManagerPersonId", () => {
        const errors = getDrivenHuntManagementErrors({ ...validHunt, huntManagerPersonId: undefined });
        expect(errors).toEqual(['"Medību vadītājs" ir obligāti aizpildāms lauks']);
    });

    it("returns an error when targetSpecies is empty and hasTargetSpecies is true", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            targetSpecies: [],
            hasTargetSpecies: true,
        });
        expect(errors).toEqual(['"Medījamo sugu saraksts" ir obligāti aizpildāms lauks']);
    });

    it("does not return an error when targetSpecies is empty and hasTargetSpecies is false", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            targetSpecies: [],
            hasTargetSpecies: false,
        });
        expect(errors).toEqual([]);
    });

    it("returns an error for less than two members if one of them is hunter", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            hunters: [
                {
                    id: 1,
                    guid: "someString",
                    personId: 1,
                    fullName: "Jānis Bērziņš",
                    huntersCardNumber: "MED1234",
                    statusId: 1,
                },
            ],
        });
        expect(errors).toEqual(["Nepieciešami vismaz divi medību dalībnieki"]);
    });

    it("returns an error for less than two members if one of them is beater", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            hunters: [],
            beaters: [
                {
                    id: 1,
                    guid: "someString",
                    userId: 1,
                    fullName: "Jānis Bērziņš",
                    statusId: 1,
                },
            ],
        });
        expect(errors).toEqual(["Nepieciešami vismaz divi medību dalībnieki"]);
    });

    it("returns an error for less than two members if one of them is guestHunter", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            hunters: [],
            guestHunters: [
                {
                    id: 1,
                    guid: "someString3",
                    fullName: "Andrew Silver",
                    guestHuntersCardNumber: "MED7777",
                    statusId: 1,
                },
            ],
        });
        expect(errors).toEqual(["Nepieciešami vismaz divi medību dalībnieki"]);
    });

    it("returns an error for less than one member", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            hunters: [],
        });
        expect(errors).toEqual(["Nepieciešami vismaz divi medību dalībnieki"]);
    });

    it("returns an error for two beaters and no hunters", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            hunters: [],
            beaters: [
                {
                    id: 1,
                    guid: "someString",
                    userId: 1,
                    fullName: "Jānis Bērziņš",
                    statusId: 1,
                },
                {
                    id: 2,
                    guid: "someString2",
                    userId: 2,
                    fullName: "Jānis Vārna",
                    statusId: 1,
                },
            ],
        });
        expect(errors).toEqual(['"Mednieku saraksts" nepieciešams vismaz viens mednieks']);
    });

    it("returns no error for two beaters and one hunter", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            hunters: [
                {
                    id: 1,
                    guid: "someString",
                    personId: 1,
                    fullName: "Jānis Bērziņš",
                    huntersCardNumber: "MED1234",
                    statusId: 1,
                },
            ],
            beaters: [
                {
                    id: 1,
                    guid: "someString",
                    userId: 1,
                    fullName: "Jānis Bērziņš",
                    statusId: 1,
                },
                {
                    id: 2,
                    guid: "someString2",
                    userId: 2,
                    fullName: "Jānis Vārna",
                    statusId: 1,
                },
            ],
        });
        expect(errors).toEqual([]);
    });

    it("returns no error for two beaters and one guest hunter", () => {
        const errors = getDrivenHuntManagementErrors({
            ...validHunt,
            hunters: [],
            guestHunters: [
                {
                    id: 1,
                    guid: "someString3",
                    fullName: "Andrew Silver",
                    guestHuntersCardNumber: "MED7777",
                    statusId: 1,
                },
            ],
            beaters: [
                {
                    id: 1,
                    guid: "someString",
                    userId: 1,
                    fullName: "Jānis Bērziņš",
                    statusId: 1,
                },
                {
                    id: 2,
                    guid: "someString2",
                    userId: 2,
                    fullName: "Jānis Vārna",
                    statusId: 1,
                },
            ],
        });
        expect(errors).toEqual([]);
    });
});
