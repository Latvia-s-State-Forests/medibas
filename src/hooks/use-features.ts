import * as React from "react";
import { Features } from "~/types/features";

export const FeaturesContext = React.createContext<Features | null>(null);

export function useFeatures() {
    const features = React.useContext(FeaturesContext);

    if (!features) {
        throw new Error("FeaturesContext not initialized");
    }

    return features;
}
