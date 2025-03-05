import * as React from "react";
import { Permit } from "~/types/permits";
import { usePermits } from "./use-permits";
import { useSelectedDistrictId } from "./use-selected-district-id";

export function useTotalPermits(): Permit[] {
    const permits = usePermits();
    const [selectedDistrictId] = useSelectedDistrictId();

    const totalPermits = React.useMemo(() => {
        return selectedDistrictId
            ? permits.filter((permit) => permit.issuedHuntingDistrictIds.includes(selectedDistrictId))
            : [];
    }, [permits, selectedDistrictId]);

    return totalPermits;
}
