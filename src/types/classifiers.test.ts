import classifiers from "../__mocks__/classifiers.json";
import { classifiersSchema } from "./classifiers";

describe("classifiers", () => {
    it("should validate", () => {
        expect(() => classifiersSchema.parse(classifiers)).not.toThrow();
    });
});
