import { DistrictPermits } from "~/screens/mtl/permits/permit-distribution-screen";

export function calculateUnpaidPermits(totalCount: number, availableCount: number, usedCount: number) {
    return totalCount - availableCount - usedCount;
}

export function calculateManuallyAssignedCount(permits: DistrictPermits[]): number {
    return permits.reduce((sum, permit) => {
        if (permit.isManuallyChanged) {
            return sum + permit.count;
        }
        return sum;
    }, 0);
}

export function calculateUndividedPermits(availableCount: number, manuallyAssignedCount: number): number {
    let undividedCount = availableCount - manuallyAssignedCount;

    if (undividedCount < 0) {
        undividedCount = 0;
    }

    return undividedCount;
}

export function calculatePermitsLeft(manuallyAssignedCount: number, available: number): boolean {
    return manuallyAssignedCount > available;
}
