import { Hunters } from "~/types/hunts";
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
    hasPermissionToManageInfrastructure,
    hasPermissionToRegisterHunt,
    hasPermissionToViewStatistics,
    hasPermissionToUpdateDistrictMemberRoles,
    hasPermissionToViewDistrictDamages,
    hasPermissionToViewDistrictMemberRoles,
    hasPermissionToViewDistrictOnMap,
    hasPermissionToViewHunt,
    hasPermissionToViewHuntedAnimalsOnMap,
    hasPermissionToViewInfrastructures,
    hasPermissionToViewInfrastructuresLayer,
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
    viewHuntedAnimalsOnMap: boolean;
    viewMtl: boolean;
    registerHunt: boolean;
    createDistrictHuntReports: boolean;
    createDistrictHuntReportsForOtherHunter: boolean;
    viewMemberManagement: boolean;
    viewDistrictDamages: boolean;
    viewInfrastructures: boolean;
    viewInfrastructuresLayer: boolean;
    viewStatistics: boolean;
    createDrivenHunt: () => boolean;
    editDrivenHunt: (districtIds: number[], huntManagerPersonId: number | undefined) => boolean;
    manageDrivenHunt: (huntManagerPersonId: number | undefined) => boolean;
    manageInfrastructure: () => boolean;
    createIndividualHunt: () => boolean;
    approveOrRejectIndividualHunt: (districtId: number) => boolean;
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
        viewHuntedAnimalsOnMap: hasPermissionToViewHuntedAnimalsOnMap(profile, selectedDistrictId),
        viewMtl: hasPermissionToViewMtl(profile),
        registerHunt: hasPermissionToRegisterHunt(profile),
        createDistrictHuntReports: hasPermissionToCreateDistrictHuntReports(profile, selectedDistrictId),
        createDistrictHuntReportsForOtherHunter: hasPermissionToCreateDistrictHuntReportsForOtherHunter(
            profile,
            selectedDistrictId
        ),
        viewMemberManagement: hasPermissionToViewMemberManagement(profile),
        viewDistrictDamages: hasPermissionToViewDistrictDamages(profile),
        viewInfrastructures: hasPermissionToViewInfrastructures(profile),
        viewInfrastructuresLayer: hasPermissionToViewInfrastructuresLayer(profile, selectedDistrictId),
        viewStatistics: hasPermissionToViewStatistics(profile),
        createDrivenHunt: () => hasPermissionToCreateDrivenHunt(profile),
        editDrivenHunt: (districtIds, huntManagerPersonId) =>
            hasPermissionToEditDrivenHunt(profile, districtIds, huntManagerPersonId),
        manageDrivenHunt: (huntManagerPersonId) => hasPermissionToManageDrivenHunt(profile, huntManagerPersonId),
        manageInfrastructure: () => hasPermissionToManageInfrastructure(profile, selectedDistrictId),
        createIndividualHunt: () => hasPermissionToCreateIndividualHunt(profile),
        approveOrRejectIndividualHunt: (districtId) =>
            hasPermissionToApproveOrRejectIndividualHunt(profile, districtId),
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
