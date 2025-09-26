import * as React from "react";
import { Feature } from "~/types/features";
import { UnlimitedHuntedAnimal } from "~/types/unlimited-hunted-animals";

export const UnlimitedHuntedAnimalsContext = React.createContext<UnlimitedHuntedAnimal[] | null>(null);

export function useUnlimitedHuntedAnimals() {
    const unlimitedHuntedAnimals = React.useContext(UnlimitedHuntedAnimalsContext);

    if (unlimitedHuntedAnimals === null) {
        throw new Error("UnlimitedHuntedAnimalsContext not initialized");
    }

    return unlimitedHuntedAnimals;
}

export function useAllUnlimitedHuntedAnimals() {
    const unlimitedHuntedAnimals = React.useContext(UnlimitedHuntedAnimalsContext);

    if (unlimitedHuntedAnimals === null) {
        throw new Error("UnlimitedHuntedAnimalsContext not initialized");
    }

    const features = unlimitedHuntedAnimals.map(
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

    return { features, data: unlimitedHuntedAnimals };
}
