import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Profile } from "~/types/profile";

export function useProfileQuery() {
    const userStorage = useUserStorage();

    return useQuery<Profile>(queryKeys.profile, () => api.getProfile(), {
        initialData: userStorage.getProfile(),
        onSuccess: (profile) => {
            logger.log("Profile loaded", profile.id);
            userStorage.setProfile(profile);
        },
        onError: (error) => {
            logger.error("Failed to load profile", error);
        },
    });
}
