import { formatTimeSpent } from "./format-time-spent";

describe("formatTimeSpent", () => {
    describe("edge cases", () => {
        it("should return '0min' for 0 minutes", () => {
            expect(formatTimeSpent(0)).toBe("0min");
        });

        it("should return '0min' for negative values", () => {
            expect(formatTimeSpent(-10)).toBe("0min");
        });
    });

    describe("minutes only", () => {
        it("should format 1 minute correctly", () => {
            expect(formatTimeSpent(1)).toBe("1min");
        });

        it("should format 30 minutes correctly", () => {
            expect(formatTimeSpent(30)).toBe("30min");
        });

        it("should format 59 minutes correctly", () => {
            expect(formatTimeSpent(59)).toBe("59min");
        });
    });

    describe("hours and minutes", () => {
        it("should format 1 hour correctly", () => {
            expect(formatTimeSpent(60)).toBe("1h");
        });

        it("should format 1 hour 30 minutes correctly", () => {
            expect(formatTimeSpent(90)).toBe("1h 30min");
        });

        it("should format 2 hours 15 minutes correctly", () => {
            expect(formatTimeSpent(135)).toBe("2h 15min");
        });

        it("should format 23 hours 59 minutes correctly", () => {
            expect(formatTimeSpent(1439)).toBe("23h 59min");
        });
    });

    describe("days, hours and minutes", () => {
        it("should format 1 day correctly", () => {
            expect(formatTimeSpent(1440)).toBe("1d");
        });

        it("should format 1 day 1 hour correctly", () => {
            expect(formatTimeSpent(1500)).toBe("1d 1h");
        });

        it("should format 1 day 1 hour 1 minute correctly", () => {
            expect(formatTimeSpent(1501)).toBe("1d 1h 1min");
        });

        it("should format 2 days 13 hours 45 minutes correctly", () => {
            expect(formatTimeSpent(3705)).toBe("2d 13h 45min");
        });

        it("should format 7 days 23 hours 59 minutes correctly", () => {
            expect(formatTimeSpent(11519)).toBe("7d 23h 59min");
        });
    });

    describe("large values", () => {
        it("should format 30 days correctly", () => {
            expect(formatTimeSpent(43200)).toBe("30d");
        });

        it("should format intensive hunting month (25 days 12 hours 30 minutes)", () => {
            // 25 days = 25 * 24 * 60 = 36,000 minutes
            // 12 hours = 12 * 60 = 720 minutes
            // 30 minutes = 30 minutes
            // Total = 36,750 minutes
            expect(formatTimeSpent(36750)).toBe("25d 12h 30min");
        });
    });

    describe("hunting scenario examples", () => {
        it("should format typical short hunt (3 hours)", () => {
            expect(formatTimeSpent(180)).toBe("3h");
        });

        it("should format typical day hunt (8 hours 30 minutes)", () => {
            expect(formatTimeSpent(510)).toBe("8h 30min");
        });

        it("should format weekend hunting trip (1 day 12 hours)", () => {
            expect(formatTimeSpent(2160)).toBe("1d 12h");
        });

        it("should format week-long hunting season (5 days 6 hours 45 minutes)", () => {
            expect(formatTimeSpent(7605)).toBe("5d 6h 45min");
        });
    });
});
