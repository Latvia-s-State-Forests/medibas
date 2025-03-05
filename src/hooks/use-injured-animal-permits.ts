import { usePermits } from "~/hooks/use-permits";
import { Permit } from "~/types/permits";
import { getInjuredAnimalPermits } from "~/utils/get-injured-animal-permits";
import { useSelectedDistrictId } from "./use-selected-district-id";

export function useInjuredAnimalPermits(): Permit[] {
    const permits = usePermits();
    const [selectedDistrictId] = useSelectedDistrictId();
    const injuredPermits = selectedDistrictId ? getInjuredAnimalPermits(permits, selectedDistrictId) : [];
    return injuredPermits;
}
