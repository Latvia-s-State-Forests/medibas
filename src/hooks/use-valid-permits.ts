import * as React from "react";
import { Permit } from "~/types/permits";
import { getValidPermits } from "~/utils/get-valid-permits";
import { usePermits } from "./use-permits";
import { useSelectedDistrictId } from "./use-selected-district-id";

export function useValidPermits(): Permit[] {
    const permits = usePermits();
    const [selectedDistrictId] = useSelectedDistrictId();

    const validPermits = React.useMemo(() => {
        return selectedDistrictId ? getValidPermits(permits, selectedDistrictId) : [];
    }, [permits, selectedDistrictId]);

    return validPermits;
}
