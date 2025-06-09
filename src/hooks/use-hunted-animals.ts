import * as React from "react";
import { Feature } from "~/types/features";
import { HuntedAnimal } from "~/types/hunted-animals";

export const HuntedAnimalsContext = React.createContext<HuntedAnimal[] | null>(null);

export function useHuntedAnimals() {
    const huntedAnimals = React.useContext(HuntedAnimalsContext);

    if (huntedAnimals === null) {
        throw new Error("HuntedAnimalsContext not initialized");
    }

    return huntedAnimals;
}

export function useAllHuntedAnimals() {
    const huntedAnimals = React.useContext(HuntedAnimalsContext);

    if (huntedAnimals === null) {
        throw new Error("HuntedAnimalsContext not initialized");
    }

    const features = huntedAnimals.map(
        (entry): Feature => ({
            type: "Feature",
            properties: {
                speciesId: entry.speciesId,
                description: entry.notes || "",
                id: entry.huntReportId,
            },
            geometry: {
                type: "Point",
                coordinates: [entry.location[0], entry.location[1]],
            },
        })
    );

    return { features, data: huntedAnimals };
}
