import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
    classifiers: ["classifiers"],
    contracts: ["contracts"],
    districts: ["districts"],
    features: ["features"],
    memberships: ["memberships"],
    profile: ["profile"],
    permits: ["permits"],
    districtDamages: ["districtDamages"],
    hunts: ["hunts"],
    news: ["news"],
} as const;
