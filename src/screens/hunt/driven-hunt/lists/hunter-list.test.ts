import mockHunt from "~/__mocks__/hunt.json";
import { Hunt } from "~/types/hunts";
import { getHunters } from "~/utils/get-hunters";

describe("getHunters", () => {
    it("returns the list of hunters and guest hunters", () => {
        const hunt: Hunt = {
            ...mockHunt,
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
            guestHunters: [
                {
                    id: 55,
                    guid: "s",
                    statusId: 1,
                    fullName: "Andrew Eric",
                    guestHuntersCardNumber: "CC1",
                },
            ],
        };

        const expectedHuntersWithCardNumbers = ["Andrew Eric CC1", "Jānis Bērziņš AP1", "Juris Roze AP2"];
        const expectedHuntersWithoutCardNumbers = ["Andrew Eric", "Jānis Bērziņš", "Juris Roze"];

        expect(getHunters(hunt, true)).toEqual(expectedHuntersWithCardNumbers);
        expect(getHunters(hunt, false)).toEqual(expectedHuntersWithoutCardNumbers);
    });

    it("returns the list of hunters", () => {
        const hunt: Hunt = {
            ...mockHunt,
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
        };

        const expectedHuntersWithCardNumbers = ["Jānis Bērziņš AP1", "Juris Roze AP2"];
        const expectedHuntersWithoutCardNumbers = ["Jānis Bērziņš", "Juris Roze"];

        expect(getHunters(hunt, true)).toEqual(expectedHuntersWithCardNumbers);
        expect(getHunters(hunt, false)).toEqual(expectedHuntersWithoutCardNumbers);
    });

    it("returns the list of guest hunters", () => {
        const hunt: Hunt = {
            ...mockHunt,
            guestHunters: [
                {
                    id: 55,
                    guid: "s",
                    statusId: 1,
                    fullName: "Andrew Eric",
                    guestHuntersCardNumber: "CC1",
                },
                {
                    id: 75,
                    guid: "e",
                    statusId: 1,
                    fullName: "Jakob Erpe",
                    guestHuntersCardNumber: "CC2",
                },
            ],
        };

        const expectedHuntersWithCardNumbers = ["Andrew Eric CC1", "Jakob Erpe CC2"];
        const expectedHuntersWithoutCardNumbers = ["Andrew Eric", "Jakob Erpe"];

        expect(getHunters(hunt, true)).toEqual(expectedHuntersWithCardNumbers);
        expect(getHunters(hunt, false)).toEqual(expectedHuntersWithoutCardNumbers);
    });
});
