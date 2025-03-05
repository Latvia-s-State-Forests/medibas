import { DistrictPermits } from "~/screens/mtl/permits/permit-distribution-screen";
import {
    calculateManuallyAssignedCount,
    calculateUnpaidPermits,
    calculateUndividedPermits,
    calculatePermitsLeft,
} from "~/utils/permit-distribution-calculations";

const permits: DistrictPermits[] = [
    {
        districtId: 1,
        districtName: "District 1",
        count: 10,
        isManuallyChanged: true,
    },
    {
        districtId: 2,
        districtName: "District 2",
        count: 10,
        isManuallyChanged: true,
    },
];

describe("Permit Calculations", () => {
    describe("calculateUnpaidPermits", () => {
        it("should correctly calculate unpaid permits", () => {
            const totalCount = 100;
            const availableCount = 50;
            const usedCount = 20;
            expect(calculateUnpaidPermits(totalCount, availableCount, usedCount)).toBe(30);
        });
    });

    describe("calculateUndividedPermits", () => {
        it("should correctly calculate undivided permits", () => {
            const availableCount = 100;
            const manuallyAssignedCount = 30;

            expect(calculateUndividedPermits(availableCount, manuallyAssignedCount)).toBe(70);
        });

        it("should not return negative values", () => {
            const availableCount = 50;
            const manuallyAssignedCount = 60;
            expect(calculateUndividedPermits(availableCount, manuallyAssignedCount)).toBe(0);
        });
    });

    describe("calculateManuallyAssignedCount", () => {
        it("should sum up manually assigned counts correctly", () => {
            const calculatePermits: DistrictPermits[] = [
                {
                    ...permits[0],
                    count: 10,
                    isManuallyChanged: true,
                },
                {
                    ...permits[1],
                    count: 30,
                    isManuallyChanged: true,
                },
            ];
            expect(calculateManuallyAssignedCount(calculatePermits)).toBe(40);
        });

        it("should return 0 if no permits are manually changed", () => {
            const calculatePermits: DistrictPermits[] = [
                {
                    ...permits[0],
                    count: 10,
                    isManuallyChanged: false,
                },
                {
                    ...permits[1],
                    count: 20,
                    isManuallyChanged: false,
                },
            ];
            expect(calculateManuallyAssignedCount(calculatePermits)).toBe(0);
        });

        describe("calculatePermitsLeft", () => {
            it("should return true if manually changed permits exceed available permits", () => {
                const manuallyAssignedCount = 11;
                const available = 10;
                expect(calculatePermitsLeft(manuallyAssignedCount, available)).toBe(true);
            });

            it("should return false if manually assigned permits do not exceed available permits", () => {
                const manuallyAssignedCount = 8;
                const available = 10;
                expect(calculatePermitsLeft(manuallyAssignedCount, available)).toBe(false);
            });

            it("should return false if manually assigned permits exactly equal available permits", () => {
                const manuallyAssignedCount = 10;
                const available = 10;
                expect(calculatePermitsLeft(manuallyAssignedCount, available)).toBe(false);
            });
        });
    });
});
