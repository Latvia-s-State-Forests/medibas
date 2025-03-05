import { SpeciesId } from "~/types/classifiers";
import { isSpeciesValidForInjured } from "~/utils/hunt";

describe("isSpeciesValidForInjured", () => {
    it("returns true if the speciesId is valid for an injured animal", () => {
        const result = isSpeciesValidForInjured(SpeciesId.Moose);
        expect(result).toBe(true);
    });

    it("returns false if the speciesId is not valid for an injured animal", () => {
        const result = isSpeciesValidForInjured(SpeciesId.Lynx);
        expect(result).toBe(false);
    });
});
