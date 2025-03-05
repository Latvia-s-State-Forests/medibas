import memberships from "../__mocks__/memberships.json";
import { membershipsSchema } from "./mtl";

describe("mtl", () => {
    it("should validate", () => {
        expect(() => membershipsSchema.parse(memberships)).not.toThrow();
    });
});
