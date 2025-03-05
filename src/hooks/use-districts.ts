import * as React from "react";
import { District } from "~/types/districts";

export const DistrictsContext = React.createContext<District[] | null>(null);

export function useDistricts() {
    const districts = React.useContext(DistrictsContext);

    if (districts === null) {
        throw new Error("DistrictsContext not initialized");
    }

    return districts;
}

export function useInfectedDistricts() {
    const districts = useDistricts();
    return districts.filter((district) => district.inAfricanSwineFeverZone);
}
