import { parseNumber } from "./parse-number";

describe("parseNumber", () => {
    it("should parse integer string", () => {
        const result = parseNumber("123");
        expect(result).toBe(123);
    });

    it("should parse decimal number with dot", () => {
        const result = parseNumber("123.45");
        expect(result).toBe(123.45);
    });

    it("should parse decimal number with comma and convert to dot", () => {
        const result = parseNumber("123,45");
        expect(result).toBe(123.45);
    });

    it("should parse negative number with dot", () => {
        const result = parseNumber("-123.45");
        expect(result).toBe(-123.45);
    });

    it("should parse negative number with comma", () => {
        const result = parseNumber("-123,45");
        expect(result).toBe(-123.45);
    });

    it("should parse zero", () => {
        const result = parseNumber("0");
        expect(result).toBe(0);
    });

    it("should parse zero with decimal places", () => {
        const result = parseNumber("0,00");
        expect(result).toBe(0);
    });

    it("should handle empty string", () => {
        const result = parseNumber("");
        expect(result).toBe(0);
    });

    it("should handle whitespace", () => {
        const result = parseNumber("  123,45  ");
        expect(result).toBe(123.45);
    });

    it("should return NaN for invalid number", () => {
        const result = parseNumber("abc");
        expect(result).toBeNaN();
    });

    it("should return NaN for multiple commas", () => {
        const result = parseNumber("123,45,67");
        expect(result).toBeNaN();
    });

    it("should return NaN for multiple dots", () => {
        const result = parseNumber("123.45.67");
        expect(result).toBeNaN();
    });

    it("should parse number with leading zero", () => {
        const result = parseNumber("0123,45");
        expect(result).toBe(123.45);
    });

    it("should parse very large number", () => {
        const result = parseNumber("999999999,99");
        expect(result).toBe(999999999.99);
    });

    it("should parse very small decimal", () => {
        const result = parseNumber("0,001");
        expect(result).toBe(0.001);
    });
});
