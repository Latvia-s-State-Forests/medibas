import { HunterCardTypeId } from "~/types/classifiers";
import { Hunters } from "~/types/hunts";
import { MemberRole, Membership } from "~/types/mtl";
import { Profile } from "~/types/profile";
import { getValidHunterCardNumber } from "./profile";

function hasAdministratorOrTrusteePermissionInDistrict(profile: Profile, districtId: number | undefined): boolean {
    if (districtId === undefined) {
        return false;
    }

    return profile.memberships.some(
        (membership) =>
            membership.huntingDistrictId === districtId && (membership.isAdministrator || membership.isTrustee)
    );
}

export function hasPermissionToViewDistrictOnMap(profile: Profile, districtId: number | undefined): boolean {
    if (districtId === undefined) {
        return false;
    }

    return profile.memberships.some((membership) => membership.huntingDistrictId === districtId);
}

export function hasPermissionToViewHunt(profile: Profile): boolean {
    const validHunterCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Hunter);
    const validSeasonCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Season);

    return (
        (validHunterCardNumber !== undefined && validSeasonCardNumber !== undefined) ||
        (profile.memberships?.some((membership) => membership.isAdministrator || membership.isTrustee) ?? false)
    );
}

export function hasPermissionToViewHuntedAnimalsOnMap(profile: Profile, districtId: number | undefined): boolean {
    if (districtId === undefined) {
        return false;
    }

    return profile.memberships.some(
        (membership) =>
            membership.huntingDistrictId === districtId &&
            (membership.isHunter || membership.isTrustee || membership.isAdministrator)
    );
}

export function hasPermissionToViewMtl(profile: Profile): boolean {
    return profile.memberships.length > 0;
}

export function hasPermissionToRegisterHunt(profile: Profile): boolean {
    const validHunterCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Hunter);
    const validSeasonCardNumber = getValidHunterCardNumber(profile, HunterCardTypeId.Season);
    return validHunterCardNumber !== undefined && validSeasonCardNumber !== undefined;
}

export function hasPermissionToCreateDistrictHuntReports(profile: Profile, districtId: number | undefined): boolean {
    if (districtId === undefined) {
        return false;
    }
    return profile.memberships.some((membership) => membership.huntingDistrictId === districtId && membership.isHunter);
}

export function hasPermissionToViewMemberManagement(profile: Profile): boolean {
    return profile.memberships.some((membership) => membership.isAdministrator || membership.isTrustee);
}

export function hasPermissionToViewDistrictDamages(profile: Profile) {
    return profile.memberships.length > 0;
}

function hasInfrastructureRole(profile: Profile): boolean {
    return profile.memberships.some(
        (membership) => membership.isTrustee || membership.isAdministrator || membership.isHunter
    );
}

export function hasPermissionToViewInfrastructures(profile: Profile): boolean {
    return hasInfrastructureRole(profile);
}

export function hasPermissionToViewInfrastructuresLayer(profile: Profile, districtId: number | undefined): boolean {
    if (districtId === undefined) {
        return false;
    }
    return profile.memberships.some(
        (membership) =>
            membership.huntingDistrictId === districtId &&
            (membership.isTrustee || membership.isAdministrator || membership.isHunter)
    );
}

export function hasPermissionToCreateDrivenHunt(profile: Profile): boolean {
    return profile.memberships.some((membership) => membership.isTrustee || membership.isAdministrator);
}

// TODO add tests
export function hasPermissionToEditDrivenHunt(
    profile: Profile,
    districtIds: number[],
    huntManagerPersonId: number | undefined
): boolean {
    if (huntManagerPersonId && huntManagerPersonId === profile.personId) {
        return true;
    }
    return profile.memberships.some(
        (membership) =>
            districtIds.includes(membership.huntingDistrictId) && (membership.isTrustee || membership.isAdministrator)
    );
}

export function hasPermissionToManageDrivenHunt(profile: Profile, huntManagerPersonId: number | undefined): boolean {
    return profile.personId === huntManagerPersonId;
}

export function hasPermissionToManageInfrastructure(profile: Profile, districtId: number | undefined) {
    return hasAdministratorOrTrusteePermissionInDistrict(profile, districtId);
}

export function hasPermissionToCreateIndividualHunt(profile: Profile): boolean {
    return profile.isHunter ?? false;
}

function isTrusteeInDistrict(profile: Profile, districtId: number): boolean {
    return profile.memberships.some(
        (membership) => membership.huntingDistrictId === districtId && membership.isTrustee
    );
}

export function hasPermissionToApproveOrRejectIndividualHunt(profile: Profile, districtId: number): boolean {
    return isTrusteeInDistrict(profile, districtId);
}

export function isHunterInHunt(profile: Profile, hunters: Hunters) {
    return hunters.some((hunter) => hunter.personId === profile.personId);
}

export function hasPermissionToCreateDistrictMember(profile: Profile, districtId: number | undefined): boolean {
    return hasAdministratorOrTrusteePermissionInDistrict(profile, districtId);
}

export function hasPermissionToDeleteDistrictMember(
    profile: Profile,
    memberships: Membership[],
    districtId: number,
    memberId: number
): boolean {
    if (!hasPermissionToCreateDistrictMember(profile, districtId)) {
        return false;
    }

    const membership = memberships.find((membership) => membership.id === districtId);
    if (!membership) {
        return false;
    }

    const member = membership.members.find((member) => member.id === memberId);
    if (!member) {
        return false;
    }

    return !member.roles.includes(MemberRole.Trustee);
}

export function hasPermissionToViewDistrictMemberRoles(profile: Profile, districtId: number | undefined): boolean {
    return hasPermissionToCreateDistrictMember(profile, districtId);
}

export function hasPermissionToUpdateDistrictMemberRoles(
    profile: Profile,
    memberships: Membership[],
    districtId: number,
    memberId: number
): boolean {
    const isUserTrustee = profile.memberships.some(
        (membership) => membership.huntingDistrictId === districtId && membership.isTrustee
    );
    if (!isUserTrustee) {
        return false;
    }

    const membership = memberships.find((membership) => membership.id === districtId);
    if (!membership) {
        return false;
    }

    const member = membership.members.find((member) => member.id === memberId);
    if (!member) {
        return false;
    }

    const isMemberTrustee = member.roles.includes(MemberRole.Trustee);
    if (isMemberTrustee) {
        return false;
    }

    return true;
}

export function hasPermissionToCreateDistrictHuntReportsForOtherHunter(
    profile: Profile,
    districtId: number | undefined
) {
    return hasAdministratorOrTrusteePermissionInDistrict(profile, districtId);
}
