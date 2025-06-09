import * as React from "react";
import { DistrictDamage, DistrictDamagesPerDistrictId } from "~/types/district-damages";
import { Feature } from "~/types/features";

export const DistrictDamagesContext = React.createContext<DistrictDamagesPerDistrictId | null>(null);

export function useDistrictDamages() {
    const districtDamages = React.useContext(DistrictDamagesContext);

    if (districtDamages === null) {
        throw new Error("DistrictDamagesContext not initialized");
    }

    return districtDamages;
}

export function useAllDistrictDamages() {
    const districtDamages = React.useContext(DistrictDamagesContext);

    if (districtDamages === null) {
        throw new Error("DistrictDamagesContext not initialized");
    }
    const { features, data } = Object.values(districtDamages).reduce(
        (acc, value) => {
            const featureEntries = value.map(
                (entry): Feature => ({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [entry.locationX, entry.locationY] },
                    properties: {
                        id: entry.id,
                        damageTypeId: entry.damageTypeId,
                    },
                })
            );

            acc.features.push(...featureEntries);
            acc.data.push(...value);

            return acc;
        },
        { features: [] as Feature[], data: [] as DistrictDamage[] }
    );

    return { features, data };
}
