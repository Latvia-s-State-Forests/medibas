import { formatMemberLabel } from "./format-member-label";

describe("formatMemberLabel", () => {
    it("should format member label", () => {
        expect(formatMemberLabel("MB1111", "Jānis", "Bērziņš")).toEqual("Jānis Bērziņš MB1111");
    });

    it("should format member label with card number and first name", () => {
        expect(formatMemberLabel("MB1111", "Jānis", undefined)).toEqual("Jānis MB1111");
    });

    it("should format member label with card number and last name", () => {
        expect(formatMemberLabel("MB1111", undefined, "Bērziņš")).toEqual("Bērziņš MB1111");
    });

    it("should format member label with card number only", () => {
        expect(formatMemberLabel("MB1111", undefined, undefined)).toEqual("MB1111");
    });

    it("should format member label with first name and last name", () => {
        expect(formatMemberLabel(undefined, "Jānis", "Bērziņš")).toEqual("Jānis Bērziņš");
    });

    it("should return empty string when all parameters are missing", () => {
        expect(formatMemberLabel(undefined, undefined, undefined)).toEqual("");
    });
});
