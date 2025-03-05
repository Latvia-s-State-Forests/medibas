import { Hunt, HuntEventStatus, HuntEventType } from "~/types/hunts";
import { MemberRole, Membership } from "~/types/mtl";
import {
    DrivenHuntFormState,
    getDefaultAddDrivenHuntFormState,
    getDefaultCopyDrivenHuntFormState,
    getDefaultEditDrivenHuntFormState,
} from "./driven-hunt-form-state";

const defaultState: DrivenHuntFormState = {
    huntManagerPersonId: undefined,
    selectedPosition: null,
    districts: [],
    date: undefined,
    time: undefined,
    notesValue: "",
    huntAllSpecies: false,
    targetSpecies: [],
    dogs: [],
    hunters: [],
    guestHunters: [],
    beaters: [],
    guestBeaters: [],
};

const memberships: Membership[] = [
    {
        id: 1,
        name: "District A ",
        members: [
            {
                id: 1,
                userId: 33,
                cardNumber: "AP1",
                managerCardNumber: "AP33",
                roles: [MemberRole.Administrator, MemberRole.Hunter, MemberRole.Manager, MemberRole.Member],
                firstName: "Jānis",
                lastName: "Bērziņš",
                validSeasonCard: {
                    validFrom: "2024-05-17T07:44:39.087556+03:00",
                    validTo: "2025-03-31T23:59:59+03:00",
                },
            },
            {
                id: 30,
                userId: 12,
                cardNumber: "AP44",
                roles: [MemberRole.Trustee, MemberRole.Hunter, MemberRole.Member],
                firstName: "Jēkabs",
                lastName: "Lapa",
                validSeasonCard: {
                    validFrom: "2024-03-26T00:00:00+02:00",
                    validTo: "2025-03-31T23:59:59+03:00",
                },
            },
        ],
    },
];

const hunt: Hunt = {
    id: 10,
    huntEventTypeId: HuntEventType.DrivenHunt,
    vmdCode: "2425-01625",
    qrCode: "2425-01625; 02/11/2025 16:52:44",
    huntManagerPersonId: 1,
    huntManagerName: "Jānis Bērziņš",
    plannedFrom: "2025-02-11T00:00:00+02:00",
    plannedTo: "2025-02-11T23:59:59.999+02:00",
    meetingTime: "2025-02-11T00:00:00+02:00",
    huntEventStatusId: HuntEventStatus.Scheduled,
    meetingPointX: 21.123793117450123,
    meetingPointY: 56.31561836763609,
    notes: "Notes",
    guid: "x",
    eventGuid: "x",
    hasTargetSpecies: false,
    canUserEdit: false,
    isReducedInfo: false,
    isSemiAutomaticWeaponUsed: false,
    isNightVisionUsed: false,
    isLightSourceUsed: false,
    isThermalScopeUsed: false,
    districts: [
        {
            id: 1,
            descriptionLv: "District A ",
        },
    ],
    hunters: [
        {
            id: 20,
            guid: "a",
            statusId: 1,
            personId: 30,
            fullName: "Juris Roze",
            huntersCardNumber: "AP2",
        },
        {
            id: 40,
            guid: "b",
            statusId: 1,
            personId: 1,
            fullName: "Jānis Bērziņš",
            huntersCardNumber: "AP1",
        },
    ],
    districtMembers: [],
    beaters: [
        {
            id: 50,
            guid: "c",
            statusId: 1,
            userId: 12,
            hunterPersonId: 30,
            fullName: "Jēkabs Lapa",
        },
    ],
    guestHunters: [
        {
            id: 55,
            guid: "s",
            statusId: 1,
            fullName: "Andrew Eric",
            guestHuntersCardNumber: "CC1",
        },
    ],
    guestBeaters: [
        {
            id: 15,
            guid: "v",
            statusId: 1,
            fullName: "Ivars Apse",
        },
    ],
    targetSpecies: [],
    dogs: [
        {
            id: 23,
            guid: "d",
            dogBreedId: 1,
            dogSubbreedId: 2,
            count: 1,
        },
        {
            id: 21,
            guid: "e",
            dogBreedId: 15,
            dogBreedOther: "Pūdelis",
            count: 3,
        },
        {
            id: 24,
            guid: "f",
            dogBreedId: 5,
            count: 2,
        },
    ],
    huntedAnimals: [],
};

const emptyHunt: Hunt = {
    id: 10,
    huntEventTypeId: HuntEventType.DrivenHunt,
    vmdCode: "2425-01625",
    qrCode: "2425-01625; 02/11/2025 16:52:44",
    huntManagerName: "Jānis Bērziņš",
    plannedFrom: "2025-02-11T00:00:00+02:00",
    plannedTo: "2025-02-11T23:59:59.999+02:00",
    meetingTime: "2025-02-11T00:00:00+02:00",
    huntEventStatusId: HuntEventStatus.Scheduled,
    guid: "x",
    eventGuid: "x",
    hasTargetSpecies: true,
    canUserEdit: false,
    isReducedInfo: false,
    isSemiAutomaticWeaponUsed: false,
    isNightVisionUsed: false,
    isLightSourceUsed: false,
    isThermalScopeUsed: false,
    districts: [],
    hunters: [],
    districtMembers: [],
    beaters: [],
    guestHunters: [],
    guestBeaters: [],
    targetSpecies: [],
    dogs: [],
    huntedAnimals: [],
};

describe("getDefaultAddDrivenHuntFormState", () => {
    it("returns empty districts when no districtId and no districtOptions provided", () => {
        const result = getDefaultAddDrivenHuntFormState();
        expect(result.districts).toEqual([]);
    });

    it("returns default state when no districtId and no districtOptions provided", () => {
        const result = getDefaultAddDrivenHuntFormState();
        expect(result).toEqual(defaultState);
    });

    it("returns empty districts when multiple districtOptions exist and districtId is undefined", () => {
        const districtOptions = [
            { label: "District A", value: 10 },
            { label: "District B", value: 20 },
        ];
        const result = getDefaultAddDrivenHuntFormState(undefined, districtOptions);
        expect(result.districts).toEqual([]);
    });

    it("returns districts with districtOptions value when there is one option", () => {
        const districtOptions = [{ label: "District A", value: 10 }];
        const result = getDefaultAddDrivenHuntFormState(undefined, districtOptions);
        expect(result.districts).toEqual([10]);
    });

    it("returns districts with districtId when multiple districtOptions exist", () => {
        const districtId = 30;
        const districtOptions = [
            { label: "District A", value: 10 },
            { label: "District B", value: 20 },
        ];
        const result = getDefaultAddDrivenHuntFormState(districtId, districtOptions);
        expect(result.districts).toEqual([districtId]);
    });

    it("returns districts with districtId when no districtOptions provided", () => {
        const districtId = 40;
        const result = getDefaultAddDrivenHuntFormState(districtId);
        expect(result.districts).toEqual([districtId]);
    });
});

describe("getDefaultEditDrivenHuntFormState", () => {
    it("returns the correct state for editing hunt", () => {
        const result = getDefaultEditDrivenHuntFormState(hunt);

        expect(result).toEqual({
            huntManagerPersonId: 1,
            selectedPosition: [21.123793117450123, 56.31561836763609],
            districts: [1],
            date: new Date("2025-02-11T00:00:00+02:00"),
            time: new Date("2025-02-10T22:00:00.000Z"),
            notesValue: "Notes",
            huntAllSpecies: true,
            targetSpecies: [],
            dogs: [
                { count: 1, dogBreedId: 1, dogSubbreedId: 2, guid: "d", id: 23 },
                {
                    count: 3,
                    dogBreedId: 15,
                    dogBreedOther: "Pūdelis",
                    guid: "e",
                    id: 21,
                },
                { count: 2, dogBreedId: 5, guid: "f", id: 24 },
            ],
            hunters: [
                {
                    fullName: "Juris Roze",
                    guid: "a",
                    huntersCardNumber: "AP2",
                    id: 20,
                    personId: 30,
                    statusId: 1,
                },
                {
                    fullName: "Jānis Bērziņš",
                    guid: "b",
                    huntersCardNumber: "AP1",
                    id: 40,
                    personId: 1,
                    statusId: 1,
                },
            ],
            guestHunters: [
                {
                    id: 55,
                    guid: "s",
                    statusId: 1,
                    fullName: "Andrew Eric",
                    guestHuntersCardNumber: "CC1",
                },
            ],
            beaters: [
                {
                    fullName: "Jēkabs Lapa",
                    guid: "c",
                    hunterPersonId: 30,
                    id: 50,
                    statusId: 1,
                    userId: 12,
                },
            ],
            guestBeaters: [
                {
                    id: 15,
                    guid: "v",
                    statusId: 1,
                    fullName: "Ivars Apse",
                },
            ],
        });
    });
    it("returns only date when other fields are empty", () => {
        const result = getDefaultEditDrivenHuntFormState(emptyHunt);

        expect(result).toEqual({
            huntManagerPersonId: undefined,
            selectedPosition: null,
            districts: [],
            date: new Date("2025-02-11T00:00:00+02:00"),
            time: new Date("2025-02-10T22:00:00.000Z"),
            notesValue: "",
            huntAllSpecies: false,
            targetSpecies: [],
            dogs: [],
            hunters: [],
            guestHunters: [],
            beaters: [],
            guestBeaters: [],
        });
    });
});

describe("getDefaultCopyDrivenHuntFormState", () => {
    it("returns the correct state for copied hunt", () => {
        const result = getDefaultCopyDrivenHuntFormState(
            {
                ...hunt,
                huntEventStatusId: HuntEventStatus.Concluded,
                hasTargetSpecies: true,
                targetSpecies: [
                    {
                        speciesId: 2,
                        permitTypeId: 5,
                    },
                    {
                        speciesId: 2,
                        permitTypeId: 6,
                    },
                ],
            },
            memberships
        );

        expect(result).toEqual({
            huntManagerPersonId: 1,
            selectedPosition: [21.123793117450123, 56.31561836763609],
            districts: [1],
            notesValue: "Notes",
            huntAllSpecies: false,
            targetSpecies: [
                {
                    speciesId: 2,
                    permitTypeId: 5,
                },
                {
                    speciesId: 2,
                    permitTypeId: 6,
                },
            ],
            dogs: [
                { count: 1, dogBreedId: 1, dogSubbreedId: 2 },
                {
                    count: 3,
                    dogBreedId: 15,
                    dogBreedOther: "Pūdelis",
                },
                { count: 2, dogBreedId: 5 },
            ],
            hunters: [
                {
                    fullName: "Juris Roze",
                    huntersCardNumber: "AP2",
                    personId: 30,
                    statusId: 1,
                },
                {
                    fullName: "Jānis Bērziņš",
                    huntersCardNumber: "AP1",
                    personId: 1,
                    statusId: 1,
                },
            ],
            guestHunters: [
                {
                    statusId: 1,
                    fullName: "Andrew Eric",
                    guestHuntersCardNumber: "CC1",
                },
            ],
            beaters: [
                {
                    fullName: "Jēkabs Lapa",
                    hunterPersonId: 30,
                    statusId: 1,
                    userId: 12,
                },
            ],
            guestBeaters: [
                {
                    statusId: 1,
                    fullName: "Ivars Apse",
                },
            ],
        });
    });
});
