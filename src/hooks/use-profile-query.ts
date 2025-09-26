import { useQuery } from "@tanstack/react-query";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryKeys } from "~/query-client";
import { Profile } from "~/types/profile";

export function useProfileQuery() {
    const userStorage = useUserStorage();

    return useQuery<Profile>({
        queryKey: queryKeys.profile,
        queryFn: async () => {
            try {
                const profile = await api.getProfile();
                logger.log("Profile loaded", profile.id);
                userStorage.setProfile(profile);
                return profile;
            } catch (error) {
                logger.error("Failed to load profile", error);
                throw error;
            }
        },
        initialData: () => userStorage.getProfile(),
    });
}
