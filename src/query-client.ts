import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
    classifiers: ["classifiers"],
    contracts: ["contracts"],
    districtDamages: ["districtDamages"],
    districts: ["districts"],
    features: ["features"],
    huntedAnimals: ["huntedAnimals"],
    hunts: ["hunts"],
    infrastructure: ["infrastructure"],
    memberships: ["memberships"],
    news: ["news"],
    permits: ["permits"],
    profile: ["profile"],
    config: ["config"],
} as const;
