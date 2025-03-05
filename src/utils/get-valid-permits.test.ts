import { addMinutes } from "date-fns";
import { Permit, StrapStatusId } from "~/types/permits";
import { isPermitValid } from "~/utils/get-valid-permits";

const permit: Permit = {
    id: 1,
    strapNumber: "123456789",
    strapStatusId: StrapStatusId.Unused,
    isReportEditingEnabled: true,
    validFrom: addMinutes(new Date(), -1).toISOString(),
    validTo: addMinutes(new Date(), 1).toISOString(),
    huntingDistrictIds: [1, 2],
    issuedHuntingDistrictIds: [1, 2],
    permitTypeId: 1,
};

describe("isPermitValid", () => {
    it("returns false if permit strapStatusId is used", () => {
        const result = isPermitValid({ ...permit, strapStatusId: StrapStatusId.Used }, 1);
        expect(result).toBe(false);
    });
    it("returns false if permit strapStatusId is canceled", () => {
        const result = isPermitValid({ ...permit, strapStatusId: StrapStatusId.Cancelled }, 1);
        expect(result).toBe(false);
    });
    it("returns false if isReportEditingEnabled is false", () => {
        const result = isPermitValid({ ...permit, isReportEditingEnabled: false }, 1);
        expect(result).toBe(false);
    });
    it("return false if permit is expired", () => {
        const result = isPermitValid({ ...permit, validTo: addMinutes(new Date(), -1).toISOString() }, 1);
        expect(result).toBe(false);
    });
    it("return false if permit is not active", () => {
        const result = isPermitValid({ ...permit, validFrom: addMinutes(new Date(), 1).toISOString() }, 1);
        expect(result).toBe(false);
    });
    it("returns false if huntingDistrictIds does not include active district", () => {
        const result = isPermitValid({ ...permit, huntingDistrictIds: [1, 2] }, 3);
        expect(result).toBe(false);
    });
});
