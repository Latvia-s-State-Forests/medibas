import { addDays } from "date-fns";
import { Member, MemberRole } from "~/types/mtl";
import { isMemberSeasonCardValid } from "./is-member-season-card-valid";

describe("isMemberSeasonCardValid", () => {
    const member: Member = {
        id: 1,
        userId: 1,
        firstName: "John",
        lastName: "Birch",
        cardNumber: "JB0003",
        roles: [MemberRole.Member, MemberRole.Hunter],
    };

    it("returns true for a valid season card", () => {
        const result = isMemberSeasonCardValid({
            ...member,
            validSeasonCard: {
                validFrom: addDays(new Date(), -1).toISOString(),
                validTo: addDays(new Date(), 1).toISOString(),
            },
        });
        expect(result).toBe(true);
    });

    it("returns false for an expired season card", () => {
        const result = isMemberSeasonCardValid({
            ...member,
            validSeasonCard: {
                validFrom: addDays(new Date(), -2).toISOString(),
                validTo: addDays(new Date(), -1).toISOString(),
            },
        });
        expect(result).toBe(false);
    });

    it("returns false for missing season card", () => {
        const result = isMemberSeasonCardValid({
            ...member,
            validSeasonCard: undefined,
        });
        expect(result).toBe(false);
    });
});
