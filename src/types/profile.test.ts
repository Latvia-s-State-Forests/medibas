import profile from "../__mocks__/profile.json";
import { profileSchema } from "./profile";

describe("profile", () => {
    it("should validate", () => {
        expect(() => profileSchema.parse(profile)).not.toThrow();
    });
});
