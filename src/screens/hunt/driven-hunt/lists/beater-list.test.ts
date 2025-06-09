import mockHunt from "~/__mocks__/hunt.json";
import { Hunt } from "~/types/hunts";
import { getBeaters } from "~/utils/get-beaters";

describe("getBeaters", () => {
    it("returns the list of beaters with guestBeaters", () => {
        const hunt: Hunt = {
            ...mockHunt,
            beaters: [
                {
                    id: 50,
                    guid: "c",
                    statusId: 1,
                    userId: 12,
                    hunterPersonId: 30,
                    fullName: "Jēkabs Lapa",
                },
                {
                    id: 51,
                    guid: "b",
                    statusId: 1,
                    userId: 13,
                    hunterPersonId: 31,
                    fullName: "Jānis Bērziņš",
                },
            ],
            guestBeaters: [
                {
                    id: 52,
                    guid: "c",
                    statusId: 1,
                    fullName: "Dāvis Lapa",
                },
                {
                    id: 53,
                    guid: "d",
                    statusId: 1,
                    fullName: "Jānis Rūda",
                },
            ],
        };

        const expectedSortedBeaters = ["Dāvis Lapa", "Jānis Bērziņš", "Jānis Rūda", "Jēkabs Lapa"];

        expect(getBeaters(hunt)).toEqual(expectedSortedBeaters);
    });

    it("returns the list of beaters", () => {
        const hunt: Hunt = {
            ...mockHunt,
            beaters: [
                {
                    id: 50,
                    guid: "c",
                    statusId: 1,
                    userId: 12,
                    hunterPersonId: 30,
                    fullName: "Jēkabs Lapa",
                },
                {
                    id: 51,
                    guid: "b",
                    statusId: 1,
                    userId: 13,
                    hunterPersonId: 31,
                    fullName: "Jānis Bērziņš",
                },
            ],
        };

        const expectedSortedBeaters = ["Jānis Bērziņš", "Jēkabs Lapa"];

        expect(getBeaters(hunt)).toEqual(expectedSortedBeaters);
    });

    it("returns the list of guest beaters", () => {
        const hunt: Hunt = {
            ...mockHunt,
            guestBeaters: [
                {
                    id: 52,
                    guid: "c",
                    statusId: 1,
                    fullName: "Dāvis Lapa",
                },
                {
                    id: 53,
                    guid: "d",
                    statusId: 1,
                    fullName: "Jānis Rūda",
                },
            ],
        };

        const expectedSortedBeaters = ["Dāvis Lapa", "Jānis Rūda"];

        expect(getBeaters(hunt)).toEqual(expectedSortedBeaters);
    });

    it("returns an empty list if there are no beaters", () => {
        const hunt: Hunt = {
            ...mockHunt,
            beaters: [],
            guestBeaters: [],
        };

        expect(getBeaters(hunt)).toEqual([]);
    });
});
