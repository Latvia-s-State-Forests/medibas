import { Profile } from "~/types/profile";

export function getDistrictDescription(profile: Profile, districtId: number) {
    const district = profile.memberships.find((membership) => membership.huntingDistrictId === districtId)
        ?.huntingDistrict.descriptionLv;
    return district ?? "";
}
