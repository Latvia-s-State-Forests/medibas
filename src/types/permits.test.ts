import permits from "../__mocks__/permits.json";
import { permitsSchema } from "./permits";

describe("permits", () => {
    it("should validate", () => {
        expect(() => permitsSchema.parse(permits)).not.toThrow();
    });
});
