import { addDays, format } from "date-fns";
import { HuntedTypeId } from "~/types/classifiers";
import { Permit, StrapStatusId } from "~/types/permits";
import { isInjuredAnimalPermit } from "~/utils/get-injured-animal-permits";

const currentDate = new Date();

function addDaysAndFormat(days: number) {
    return format(addDays(currentDate, days), "yyyy-MM-dd");
}

const injuredPermit: Permit = {
    isReportEditingEnabled: true,
    strapNumber: "123",
    validFrom: addDaysAndFormat(-20),
    validTo: addDaysAndFormat(20),
    id: 100,
    strapStatusId: StrapStatusId.Used,
    permitTypeId: 1,
    huntedTypeId: 2,
    permitAllowanceId: 1,
    injuredDate: addDaysAndFormat(-1),
    huntingDistrictIds: [1],
    issuedHuntingDistrictIds: [1],
};

describe("isInjuredAnimalPermit", () => {
    it("strap status unused", () => {
        const permit: Permit = {
            ...injuredPermit,
            strapStatusId: StrapStatusId.Unused,
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(false);
    });

    it("report editing not enabled", () => {
        const permit: Permit = {
            ...injuredPermit,
            isReportEditingEnabled: false,
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(false);
    });

    it("hunted type not injured", () => {
        const permit: Permit = {
            ...injuredPermit,
            huntedTypeId: HuntedTypeId.Hunted,
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(false);
    });

    it("injured date not set", () => {
        const permit: Permit = {
            ...injuredPermit,
            injuredDate: undefined,
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(false);
    });

    it("injured date - current date < 14 days", () => {
        const permit: Permit = {
            ...injuredPermit,
            injuredDate: addDaysAndFormat(-13),
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(true);
    });

    it("injured date - current date == 14 days", () => {
        const permit: Permit = {
            ...injuredPermit,
            injuredDate: addDaysAndFormat(-14),
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(true);
    });

    it("injured date - current date > 14 days", () => {
        const permit: Permit = {
            ...injuredPermit,
            injuredDate: addDaysAndFormat(-15),
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(false);
    });

    it("hunting district not valid", () => {
        const permit: Permit = {
            ...injuredPermit,
            huntingDistrictIds: [2],
        };
        const result = isInjuredAnimalPermit(permit, 1);
        expect(result).toBe(false);
    });
});
