import contracts from "~/__mocks__/contracts.json";
import { getContractsResponseSchema } from "./contracts";

describe("getContractsRequestSchema", () => {
    it("should be valid", () => {
        expect(() => getContractsResponseSchema.parse(contracts)).not.toThrow();
    });
});
