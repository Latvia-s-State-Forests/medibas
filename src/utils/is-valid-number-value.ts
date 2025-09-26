import { parseNumber } from "./parse-number";

export function isValidNumberValue(value: string) {
    const number = parseNumber(value);
    return !isNaN(number);
}
