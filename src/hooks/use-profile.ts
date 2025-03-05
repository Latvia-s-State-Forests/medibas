import * as React from "react";
import { Profile } from "~/types/profile";

export const ProfileContext = React.createContext<Profile | null>(null);

export function useProfile() {
    const profile = React.useContext(ProfileContext);

    if (!profile) {
        throw new Error("ProfileContext not initialized");
    }

    return profile;
}
