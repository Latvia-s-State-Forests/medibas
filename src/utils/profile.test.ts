import { addDays, addHours, format } from "date-fns";
import { HunterCardTypeId } from "~/types/classifiers";
import { HunterCard, Profile } from "~/types/profile";
import { getValidHunterCardNumber, isHunterCardActive } from "~/utils/profile";

function cardDate(daysToAdd = 0, hoursToAdd = 0): string {
    const currentDate = new Date();
    let cardDate = addDays(currentDate, daysToAdd);
    if (hoursToAdd) {
        cardDate = addHours(cardDate, hoursToAdd);
    }
    const result = format(cardDate, "yyyy-MM-dd'T'HH:mm:ss");
    return result;
}

const validHunterCard: HunterCard = {
    id: 25,
    cardNumber: "MBH1111",
    cardTypeId: 1,
};

const validHuntManagerCard: HunterCard = {
    id: 27,
    cardNumber: "MBM1111",
    cardTypeId: 2,
};

const validSeasonCard: HunterCard = {
    id: 26,
    cardNumber: "MBS1111",
    cardTypeId: 3,

    validFrom: cardDate(-1),
    validTo: cardDate(1),
};

const validProfile: Profile = {
    id: 629,
    vmdId: "M_Berzins",
    validHuntersCardNumber: "MB1111",
    isHunter: true,
    firstName: "Marts",
    lastName: "Bērziņš",
    memberships: [],
    hunterCards: [validHunterCard, validHuntManagerCard, validSeasonCard],
};

describe("isHunterCardActive", () => {
    it("from and to dates available and active", () => {
        const card = {
            ...validHunterCard,
            validFrom: cardDate(-1),
            validTo: cardDate(1),
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(true);
    });

    it("from and to dates available and expired", () => {
        const card = {
            ...validHunterCard,
            validFrom: cardDate(-2),
            validTo: cardDate(-1),
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(false);
    });

    it("from and to dates available and pending", () => {
        const card = {
            ...validHunterCard,
            validFrom: cardDate(1),
            validTo: cardDate(2),
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(false);
    });

    it("from and to dates available and valid for 1h", () => {
        const card = {
            ...validHunterCard,
            validFrom: cardDate(),
            validTo: cardDate(undefined, 1),
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(true);
    });

    it("from date available and active", () => {
        const card = {
            ...validHunterCard,
            validTo: undefined,
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(true);
    });

    it("from date available and pending", () => {
        const card = {
            ...validHunterCard,
            validFrom: cardDate(1),
            validTo: undefined,
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(false);
    });

    it("from date available and valid from today", () => {
        const card = {
            ...validHunterCard,
            validFrom: cardDate(),
            validTo: undefined,
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(true);
    });

    it("to date available and active", () => {
        const card = {
            ...validHunterCard,
            validFrom: undefined,
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(true);
    });

    it("to date available and expired", () => {
        const card = {
            ...validHunterCard,
            validFrom: undefined,
            validTo: cardDate(-1),
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(false);
    });

    it("to date available and valid for 1h", () => {
        const card = {
            ...validHunterCard,
            validFrom: undefined,
            validTo: cardDate(undefined, 1),
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(true);
    });

    it("no dates available", () => {
        const card = {
            ...validHunterCard,
            validFrom: undefined,
            validTo: undefined,
        };
        const result = isHunterCardActive(card);
        expect(result).toBe(true);
    });
});

describe("getValidHunterCardNumber", () => {
    it("valid card numbers by type", () => {
        const huntersCardNumber = getValidHunterCardNumber(validProfile, HunterCardTypeId.Hunter);
        expect(huntersCardNumber).toBe("MBH1111");

        const huntManagerCardNumber = getValidHunterCardNumber(validProfile, HunterCardTypeId.HuntManager);
        expect(huntManagerCardNumber).toBe("MBM1111");

        const seasonCardNumber = getValidHunterCardNumber(validProfile, HunterCardTypeId.Season);
        expect(seasonCardNumber).toBe("MBS1111");
    });

    it("expired card numbers by type", () => {
        const profile = {
            ...validProfile,
            hunterCards: [
                {
                    ...validHunterCard,
                    validFrom: cardDate(-2),
                    validTo: cardDate(-1),
                },
                {
                    ...validHuntManagerCard,
                    validFrom: cardDate(-2),
                    validTo: cardDate(-1),
                },
                {
                    ...validSeasonCard,
                    validFrom: cardDate(-2),
                    validTo: cardDate(-1),
                },
            ],
        };
        const huntersCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Hunter);
        expect(huntersCardNumber).toBe(undefined);

        const huntManagerCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.HuntManager);
        expect(huntManagerCardNumber).toBe(undefined);

        const seasonCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Season);
        expect(seasonCardNumber).toBe(undefined);
    });
});
