import { isValidNumberValue } from "./is-valid-number-value";

describe("isValidNumberValue", () => {
    it("should return true for valid integer string", () => {
        const result = isValidNumberValue("123");
        expect(result).toBe(true);
    });

    it("should return true for valid decimal number with dot", () => {
        const result = isValidNumberValue("123.45");
        expect(result).toBe(true);
    });

    it("should return true for valid decimal number with comma", () => {
        const result = isValidNumberValue("123,45");
        expect(result).toBe(true);
    });

    it("should return true for negative number with dot", () => {
        const result = isValidNumberValue("-123.45");
        expect(result).toBe(true);
    });

    it("should return true for negative number with comma", () => {
        const result = isValidNumberValue("-123,45");
        expect(result).toBe(true);
    });

    it("should return true for zero", () => {
        const result = isValidNumberValue("0");
        expect(result).toBe(true);
    });

    it("should return true for zero with decimal places", () => {
        const result = isValidNumberValue("0,00");
        expect(result).toBe(true);
    });

    it("should return true for empty string (parseNumber returns 0)", () => {
        const result = isValidNumberValue("");
        expect(result).toBe(true);
    });

    it("should return true for whitespace (parseNumber handles it)", () => {
        const result = isValidNumberValue("  123,45  ");
        expect(result).toBe(true);
    });

    it("should return true for number with leading zero", () => {
        const result = isValidNumberValue("0123,45");
        expect(result).toBe(true);
    });

    it("should return true for very large number", () => {
        const result = isValidNumberValue("999999999,99");
        expect(result).toBe(true);
    });

    it("should return true for very small decimal", () => {
        const result = isValidNumberValue("0,001");
        expect(result).toBe(true);
    });

    it("should return false for invalid number text", () => {
        const result = isValidNumberValue("abc");
        expect(result).toBe(false);
    });

    it("should return false for multiple commas", () => {
        const result = isValidNumberValue("123,45,67");
        expect(result).toBe(false);
    });

    it("should return false for multiple dots", () => {
        const result = isValidNumberValue("123.45.67");
        expect(result).toBe(false);
    });

    it("should return false for mixed text and numbers", () => {
        const result = isValidNumberValue("123abc");
        expect(result).toBe(false);
    });

    it("should return false for text with numbers", () => {
        const result = isValidNumberValue("abc123");
        expect(result).toBe(false);
    });

    it("should return false for special characters", () => {
        const result = isValidNumberValue("@#$%");
        expect(result).toBe(false);
    });

    it("should return false for mixed valid format with invalid characters", () => {
        const result = isValidNumberValue("123,45@");
        expect(result).toBe(false);
    });

    it("should return true for positive number with plus sign", () => {
        const result = isValidNumberValue("+123,45");
        expect(result).toBe(true);
    });

    it("should return true for scientific notation", () => {
        const result = isValidNumberValue("1e5");
        expect(result).toBe(true);
    });

    it("should return true for scientific notation with decimal", () => {
        const result = isValidNumberValue("1,5e2");
        expect(result).toBe(true);
    });
});
