import { Hunters, HuntEventStatus, HuntPlace } from "~/types/hunts";
import {
    hasPermissionToApproveOrRejectIndividualHunt,
    hasPermissionToCreateDistrictHuntReports,
    hasPermissionToCreateDistrictHuntReportsForOtherHunter,
    hasPermissionToCreateDistrictMember,
    hasPermissionToCreateDrivenHunt,
    hasPermissionToCreateIndividualHunt,
    hasPermissionToDeleteDistrictMember,
    hasPermissionToEditDrivenHunt,
    hasPermissionToManageDrivenHunt,
    hasPermissionToUpdateDistrictMemberRoles,
    hasPermissionToViewDistrictDamages,
    hasPermissionToViewDistrictMemberRoles,
    hasPermissionToViewDistrictOnMap,
    hasPermissionToViewHunt,
    hasPermissionToViewIndividualHunt,
    hasPermissionToViewMemberManagement,
    hasPermissionToViewMtl,
    isHunterInHunt,
} from "../utils/permissions";
import { useMemberships } from "./use-memberships";
import { useProfile } from "./use-profile";
import { useSelectedDistrictId } from "./use-selected-district-id";

type Permissions = {
    viewDistrictOnMap: boolean;
    viewHunt: boolean;
    viewMtl: boolean;
    createDistrictHuntReports: boolean;
    createDistrictHuntReportsForOtherHunter: boolean;
    viewMemberManagement: boolean;
    viewDistrictDamages: boolean;
    createDrivenHunt: () => boolean;
    editDrivenHunt: (districtIds: number[], huntManagerPersonId: number | undefined) => boolean;
    manageDrivenHunt: (huntManagerPersonId: number | undefined) => boolean;
    createIndividualHunt: () => boolean;
    approveOrRejectIndividualHunt: (districtId: number) => boolean;
    viewIndividualHunt: (
        hunterPersonId: number,
        huntEventStatus: HuntEventStatus,
        huntPlace: HuntPlace,
        districtId: number | undefined
    ) => boolean;
    isHunterInHunt: (hunters: Hunters) => boolean;
    createDistrictMember: (districtId: number) => boolean;
    deleteDistrictMember: (districtId: number, memberId: number) => boolean;
    viewDistrictMemberRoles: (districtId: number) => boolean;
    updateDistrictMemberRoles: (districtId: number, memberId: number) => boolean;
};

export function usePermissions(): Permissions {
    const profile = useProfile();
    const memberships = useMemberships();

    const [selectedDistrictId] = useSelectedDistrictId();

    const permissions: Permissions = {
        viewDistrictOnMap: hasPermissionToViewDistrictOnMap(profile, selectedDistrictId),
        viewHunt: hasPermissionToViewHunt(profile),
        viewMtl: hasPermissionToViewMtl(profile),
        createDistrictHuntReports: hasPermissionToCreateDistrictHuntReports(profile, selectedDistrictId),
        createDistrictHuntReportsForOtherHunter: hasPermissionToCreateDistrictHuntReportsForOtherHunter(
            profile,
            selectedDistrictId
        ),
        viewMemberManagement: hasPermissionToViewMemberManagement(profile),
        viewDistrictDamages: hasPermissionToViewDistrictDamages(profile),
        createDrivenHunt: () => hasPermissionToCreateDrivenHunt(profile),
        editDrivenHunt: (districtIds, huntManagerPersonId) =>
            hasPermissionToEditDrivenHunt(profile, districtIds, huntManagerPersonId),
        manageDrivenHunt: (huntManagerPersonId) => hasPermissionToManageDrivenHunt(profile, huntManagerPersonId),
        createIndividualHunt: () => hasPermissionToCreateIndividualHunt(profile),
        approveOrRejectIndividualHunt: (districtId) =>
            hasPermissionToApproveOrRejectIndividualHunt(profile, districtId),
        viewIndividualHunt: (hunterPersonId, huntEventStatus, huntPlace, districtId) =>
            hasPermissionToViewIndividualHunt(profile, hunterPersonId, huntEventStatus, huntPlace, districtId),
        isHunterInHunt: (hunters: Hunters) => isHunterInHunt(profile, hunters),
        createDistrictMember: (districtId) => hasPermissionToCreateDistrictMember(profile, districtId),
        deleteDistrictMember: (districtId, memberId) =>
            hasPermissionToDeleteDistrictMember(profile, memberships, districtId, memberId),
        viewDistrictMemberRoles: (districtId) => hasPermissionToViewDistrictMemberRoles(profile, districtId),
        updateDistrictMemberRoles: (districtId, memberId) =>
            hasPermissionToUpdateDistrictMemberRoles(profile, memberships, districtId, memberId),
    };
    return permissions;
}
