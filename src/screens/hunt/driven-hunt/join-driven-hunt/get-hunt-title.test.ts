import { getHuntTitle } from "./get-hunt-title";

describe("getHuntTitle", () => {
    it("returns hunt title", () => {
        const result = getHuntTitle(
            "2425-00001",
            [{ descriptionLv: "First district " }, { descriptionLv: "Second district" }],
            "2025-02-21T09:00:00.000"
        );
        expect(result).toBe("2425-00001, First district, Second district, 21.02.2025");
    });
});
