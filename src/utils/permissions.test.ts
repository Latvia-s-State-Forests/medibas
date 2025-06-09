import { HunterCardTypeId } from "~/types/classifiers";
import { Hunters } from "~/types/hunts";
import { MemberRole, Membership } from "../types/mtl";
import { Profile } from "../types/profile";
import {
    hasPermissionToApproveOrRejectIndividualHunt,
    hasPermissionToCreateDistrictHuntReports,
    hasPermissionToCreateDistrictHuntReportsForOtherHunter,
    hasPermissionToCreateDistrictMember,
    hasPermissionToCreateDrivenHunt,
    hasPermissionToCreateIndividualHunt,
    hasPermissionToManageInfrastructure,
    hasPermissionToDeleteDistrictMember,
    hasPermissionToManageDrivenHunt,
    hasPermissionToUpdateDistrictMemberRoles,
    hasPermissionToViewDistrictDamages,
    hasPermissionToViewDistrictMemberRoles,
    hasPermissionToViewDistrictOnMap,
    hasPermissionToViewMemberManagement,
    hasPermissionToViewMtl,
    isHunterInHunt,
    hasPermissionToRegisterHunt,
    hasPermissionToViewHunt,
    hasPermissionToViewHuntedAnimalsOnMap,
    hasPermissionToViewInfrastructures,
    hasPermissionToViewInfrastructuresLayer,
} from "./permissions";

describe("hasPermissionToViewDistrictOnMap", () => {
    const profile: unknown = {
        memberships: [{ huntingDistrictId: 1 }],
    };
    it("returns true if has district membership", () => {
        const result = hasPermissionToViewDistrictOnMap(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns false if does not have district membership", () => {
        const result = hasPermissionToViewDistrictOnMap(profile as Profile, 2);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToViewHunt", () => {
    it("valid hunter card, valid season card", () => {
        const profile: unknown = {
            hunterCards: [
                { cardTypeId: HunterCardTypeId.Hunter, cardNumber: "H1" },
                { cardTypeId: HunterCardTypeId.Season, cardNumber: "S1" },
            ],
            memberships: [],
        };
        const result = hasPermissionToViewHunt(profile as Profile);
        expect(result).toBe(true);
    });

    it("valid hunter card, missing season card", () => {
        const profile: unknown = {
            hunterCards: [{ cardTypeId: HunterCardTypeId.Hunter, cardNumber: "H1" }],
            memberships: [],
        };
        const result = hasPermissionToViewHunt(profile as Profile);
        expect(result).toBe(false);
    });

    it("missing hunter card, valid season card", () => {
        const profile: unknown = {
            hunterCards: [{ cardTypeId: HunterCardTypeId.Season, cardNumber: "S1" }],
            memberships: [],
        };
        const result = hasPermissionToViewHunt(profile as Profile);
        expect(result).toBe(false);
    });

    it("missing hunter card, missing season card", () => {
        const profile: unknown = {
            hunterCards: [],
            memberships: [],
        };
        const result = hasPermissionToViewHunt(profile as Profile);
        expect(result).toBe(false);
    });

    it("administrator without valid cards", () => {
        const profile: unknown = {
            hunterCards: [],
            memberships: [
                {
                    huntingDistrictId: 1,
                    isAdministrator: true,
                },
            ],
        };
        const result = hasPermissionToViewHunt(profile as Profile);
        expect(result).toBe(true);
    });

    it("trustee without valid cards", () => {
        const profile: unknown = {
            hunterCards: [],
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToViewHunt(profile as Profile);
        expect(result).toBe(true);
    });
});

describe("hasPermissionToViewHuntedAnimalsOnMap", () => {
    it("returns false if districtId is undefined", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: true }],
        };
        const result = hasPermissionToViewHuntedAnimalsOnMap(profile as Profile, undefined);
        expect(result).toBe(false);
    });

    it("returns true if user is a hunter in the district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: true }],
        };
        const result = hasPermissionToViewHuntedAnimalsOnMap(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns true if user is a trustee in the district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isTrustee: true }],
        };
        const result = hasPermissionToViewHuntedAnimalsOnMap(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns true if user is an administrator in the district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isAdministrator: true }],
        };
        const result = hasPermissionToViewHuntedAnimalsOnMap(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns false if user has membership but no required roles", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: false, isTrustee: false, isAdministrator: false }],
        };
        const result = hasPermissionToViewHuntedAnimalsOnMap(profile as Profile, 1);
        expect(result).toBe(false);
    });

    it("returns false if user has required roles but in a different district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: true }],
        };
        const result = hasPermissionToViewHuntedAnimalsOnMap(profile as Profile, 2);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToViewMtl", () => {
    it("returns true if has district membership", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                },
            ],
        };
        const result = hasPermissionToViewMtl(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns false if does not have district membership", () => {
        const profile: unknown = {
            memberships: [],
        };
        const result = hasPermissionToViewMtl(profile as Profile);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToRegisterHunt", () => {
    it("valid hunter card, valid season card", () => {
        const profile: unknown = {
            hunterCards: [
                { cardTypeId: HunterCardTypeId.Hunter, cardNumber: "H1" },
                { cardTypeId: HunterCardTypeId.Season, cardNumber: "S1" },
            ],
        };
        const result = hasPermissionToRegisterHunt(profile as Profile);
        expect(result).toBe(true);
    });

    it("valid hunter card, missing season card", () => {
        const profile: unknown = {
            hunterCards: [{ cardTypeId: HunterCardTypeId.Hunter, cardNumber: "H1" }],
        };
        const result = hasPermissionToRegisterHunt(profile as Profile);
        expect(result).toBe(false);
    });

    it("missing hunter card, valid season card", () => {
        const profile: unknown = {
            hunterCards: [{ cardTypeId: HunterCardTypeId.Season, cardNumber: "S1" }],
        };
        const result = hasPermissionToRegisterHunt(profile as Profile);
        expect(result).toBe(false);
    });

    it("missing hunter card, missing season card", () => {
        const profile: unknown = {
            hunterCards: [],
        };
        const result = hasPermissionToRegisterHunt(profile as Profile);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToViewDistrictDamages", () => {
    it("returns true if has district membership", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                },
            ],
        };
        const result = hasPermissionToViewDistrictDamages(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns false if does not have district membership", () => {
        const profile: unknown = {
            memberships: [],
        };
        const result = hasPermissionToViewDistrictDamages(profile as Profile);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToViewInfrastructures", () => {
    it("returns true if has administrator role", () => {
        const profile: unknown = {
            memberships: [
                {
                    isMember: true,
                    isAdministrator: true,
                },
            ],
        };
        const result = hasPermissionToViewInfrastructures(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns true if has trustee role", () => {
        const profile: unknown = {
            memberships: [
                {
                    isMember: true,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToViewInfrastructures(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns true if has hunter role", () => {
        const profile: unknown = {
            memberships: [
                {
                    isMember: true,
                    isAdministrator: false,
                    isTrustee: false,
                    isHunter: true,
                },
            ],
        };
        const result = hasPermissionToViewInfrastructures(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns false if does not have any required roles", () => {
        const profile: unknown = {
            memberships: [
                {
                    isMember: true,
                    isAdministrator: false,
                    isTrustee: false,
                    isHunter: false,
                },
            ],
        };
        const result = hasPermissionToViewInfrastructures(profile as Profile);
        expect(result).toBe(false);
    });

    it("returns false if has empty memberships", () => {
        const profile: unknown = {
            memberships: [],
        };
        const result = hasPermissionToViewInfrastructures(profile as Profile);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToViewInfrastructuresLayer", () => {
    it("returns false if districtId is undefined", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: true }],
        };
        const result = hasPermissionToViewInfrastructuresLayer(profile as Profile, undefined);
        expect(result).toBe(false);
    });

    it("returns true if user is a hunter in the district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: true }],
        };
        const result = hasPermissionToViewInfrastructuresLayer(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns true if user is a trustee in the district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isTrustee: true }],
        };
        const result = hasPermissionToViewInfrastructuresLayer(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns true if user is an administrator in the district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isAdministrator: true }],
        };
        const result = hasPermissionToViewInfrastructuresLayer(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns false if user has membership but no required roles", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: false, isTrustee: false, isAdministrator: false }],
        };
        const result = hasPermissionToViewInfrastructuresLayer(profile as Profile, 1);
        expect(result).toBe(false);
    });

    it("returns false if user has required roles but in a different district", () => {
        const profile: unknown = {
            memberships: [{ huntingDistrictId: 1, isHunter: true }],
        };
        const result = hasPermissionToViewInfrastructuresLayer(profile as Profile, 2);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToCreateDistrictHuntReports", () => {
    it("returns true if is a hunter in the district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isHunter: true,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictHuntReports(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns false if not a hunter in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isHunter: false,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictHuntReports(profile as Profile, 1);
        expect(result).toBe(false);
    });

    it("returns false if not a member of district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isHunter: false,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictHuntReports(profile as Profile, 2);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToViewMemberManagement", () => {
    it("returns true if has administrator role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isAdministrator: true,
                },
            ],
        };
        const result = hasPermissionToViewMemberManagement(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns true if has trustee role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToViewMemberManagement(profile as Profile);
        expect(result).toBe(true);
    });
    it("returns false if admin/trustee role has not been assigned in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                },
            ],
        };
        const result = hasPermissionToViewMemberManagement(profile as Profile);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToCreateDrivenHunt", () => {
    it("returns true if has administrator role", () => {
        const profile: unknown = {
            memberships: [
                {
                    isMember: true,
                    isAdministrator: true,
                },
            ],
        };
        const result = hasPermissionToCreateDrivenHunt(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns true if has trustee role", () => {
        const profile: unknown = {
            memberships: [
                {
                    isMember: true,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToCreateDrivenHunt(profile as Profile);
        expect(result).toBe(true);
    });

    it("returns false if does not have trustee and administrator role", () => {
        const profile: unknown = {
            memberships: [
                {
                    isMember: true,
                    isAdministrator: false,
                    isTrustee: false,
                },
            ],
        };
        const result = hasPermissionToCreateDrivenHunt(profile as Profile);
        expect(result).toBe(false);
    });

    it("returns false if no memberships", () => {
        const profile: unknown = {
            memberships: [],
        };
        const result = hasPermissionToCreateDrivenHunt(profile as Profile);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToManageDrivenHunt", () => {
    it("returns true if is hunt manager", () => {
        const profile: unknown = {
            personId: 1,
        };
        const huntManagerPersonId: unknown = 1;
        const result = hasPermissionToManageDrivenHunt(profile as Profile, huntManagerPersonId as number);
        expect(result).toBe(true);
    });

    it("returns false if is not hunt manager", () => {
        const profile: unknown = {
            personId: 1,
        };
        const huntManagerPersonId: unknown = 2;
        const result = hasPermissionToManageDrivenHunt(profile as Profile, huntManagerPersonId as number);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToManageInfrastructure", () => {
    it("returns true if has administrator role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isAdministrator: true,
                },
            ],
        };
        const result = hasPermissionToManageInfrastructure(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns true if has trustee role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToManageInfrastructure(profile as Profile, 1);
        expect(result).toBe(true);
    });
    it("returns false if admin/trustee role has not been assigned in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                },
            ],
        };
        const result = hasPermissionToManageInfrastructure(profile as Profile, 1);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToCreateIndividualHunt", () => {
    it("returns true if is hunter", () => {
        const profile = {
            isHunter: true,
        } as Profile;
        const result = hasPermissionToCreateIndividualHunt(profile);

        expect(result).toBe(true);
    });

    it("returns false if is not hunter", () => {
        const profile = {
            isHunter: false,
        } as Profile;
        const result = hasPermissionToCreateIndividualHunt(profile);

        expect(result).toBe(false);
    });
});

describe("hasPermissionToApproveOrRejectIndividualHunt", () => {
    it("returns true if isTrustee is true", () => {
        const profile = {
            personId: 1,
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: true,
                },
            ],
        } as Profile;

        const districtId = 1;
        const result = hasPermissionToApproveOrRejectIndividualHunt(profile, districtId);

        expect(result).toBe(true);
    });

    it("returns false if isTrustee is false", () => {
        const profile = {
            personId: 1,
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: false,
                },
            ],
        } as Profile;

        const districtId = 1;
        const result = hasPermissionToApproveOrRejectIndividualHunt(profile, districtId);

        expect(result).toBe(false);
    });

    it("returns false if isTrustee is in different district", () => {
        const profile = {
            personId: 1,
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: true,
                },
            ],
        } as Profile;

        const districtId = 2;
        const result = hasPermissionToApproveOrRejectIndividualHunt(profile, districtId);

        expect(result).toBe(false);
    });
});

describe("isHunterInHunt", () => {
    it("returns true if profile personId is in hunters object", () => {
        const profile = {
            personId: 2,
        } as Profile;
        const hunters = [
            {
                id: 111,
                personId: 1,
                fullName: "Jānis Bērziņš",
                huntersCardNumber: "MB1111",
            },
            {
                id: 112,
                personId: 2,
                fullName: "Jānis Bērziņš",
                huntersCardNumber: "MB1111",
            },
        ] as Hunters;
        const result = isHunterInHunt(profile, hunters);

        expect(result).toBe(true);
    });

    it("returns false if profile personId is not in hunters object", () => {
        const profile = {
            personId: 3,
        } as Profile;
        const hunters = [
            {
                id: 111,
                personId: 1,
                fullName: "Jānis Bērziņš",
                huntersCardNumber: "MB1111",
            },
            {
                id: 112,
                personId: 2,
                fullName: "Jānis Bērziņš",
                huntersCardNumber: "MB1111",
            },
        ] as Hunters;
        const result = isHunterInHunt(profile, hunters);

        expect(result).toBe(false);
    });
});

describe("hasPermissionToCreateDistrictMembers", () => {
    it("returns true if has administrator role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isAdministrator: true,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictMember(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns true if has trustee role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictMember(profile as Profile, 1);
        expect(result).toBe(true);
    });
    it("returns false if admin/trustee role has not been assigned in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictMember(profile as Profile, 1);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToDeleteDistrictMember", () => {
    it("manager to delete hunter", () => {
        const profile: unknown = {
            id: 1,
            memberships: [
                {
                    huntingDistrictId: 1,
                    isManager: true,
                },
            ],
        };
        const memberships: unknown = [
            {
                id: 1,
                members: [
                    {
                        id: 1,
                        roles: [MemberRole.Member, MemberRole.Hunter],
                    },
                ],
            },
        ];
        const result = hasPermissionToDeleteDistrictMember(profile as Profile, memberships as Membership[], 1, 1);
        expect(result).toBe(false);
    });

    it("administrator to delete administrator", () => {
        const profile: unknown = {
            id: 1,
            memberships: [
                {
                    huntingDistrictId: 1,
                    isAdministrator: true,
                },
            ],
        };
        const memberships: unknown = [
            {
                id: 1,
                members: [
                    {
                        id: 1,
                        roles: [MemberRole.Member, MemberRole.Hunter, MemberRole.Manager, MemberRole.Administrator],
                    },
                ],
            },
        ];
        const result = hasPermissionToDeleteDistrictMember(profile as Profile, memberships as Membership[], 1, 1);
        expect(result).toBe(true);
    });

    it("administrator to delete trustee", () => {
        const profile: unknown = {
            id: 1,
            memberships: [
                {
                    huntingDistrictId: 1,
                    isAdministrator: true,
                },
            ],
        };
        const memberships: unknown = [
            {
                id: 1,
                members: [
                    {
                        id: 1,
                        roles: [
                            MemberRole.Member,
                            MemberRole.Hunter,
                            MemberRole.Manager,
                            MemberRole.Administrator,
                            MemberRole.Trustee,
                        ],
                    },
                ],
            },
        ];
        const result = hasPermissionToDeleteDistrictMember(profile as Profile, memberships as Membership[], 1, 1);
        expect(result).toBe(false);
    });

    it("trustee to delete administrator", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: true,
                },
            ],
        };
        const memberships: unknown = [
            {
                id: 1,
                members: [
                    {
                        id: 1,
                        roles: [MemberRole.Member, MemberRole.Hunter, MemberRole.Manager, MemberRole.Administrator],
                    },
                ],
            },
        ];
        const result = hasPermissionToDeleteDistrictMember(profile as Profile, memberships as Membership[], 1, 1);
        expect(result).toBe(true);
    });

    it("trustee to delete trustee", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: true,
                },
            ],
        };
        const memberships: unknown = [
            {
                id: 1,
                members: [
                    {
                        id: 1,
                        roles: [
                            MemberRole.Member,
                            MemberRole.Hunter,
                            MemberRole.Manager,
                            MemberRole.Administrator,
                            MemberRole.Trustee,
                        ],
                    },
                ],
            },
        ];
        const result = hasPermissionToDeleteDistrictMember(profile as Profile, memberships as Membership[], 1, 1);
        expect(result).toBe(false);
    });

    it("trustee to delete from missing membership", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToDeleteDistrictMember(profile as Profile, [], 1, 1);
        expect(result).toBe(false);
    });

    it("trustee to delete missing member", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isTrustee: true,
                },
            ],
        };
        const memberships: unknown = [
            {
                id: 1,
                members: [],
            },
        ];
        const result = hasPermissionToDeleteDistrictMember(profile as Profile, memberships as Membership[], 1, 1);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToViewDistrictMemberRoles", () => {
    it("returns true if has trustee role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToViewDistrictMemberRoles(profile as Profile, 1);
        expect(result).toBe(true);
    });
    it("returns false if trustee role has not been assigned in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                },
            ],
        };
        const result = hasPermissionToViewDistrictMemberRoles(profile as Profile, 1);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToUpdateDistrictMemberRoles", () => {
    it("returns true if has trustee role in district", () => {
        const profile: Profile = {
            id: 1,
            memberships: [
                {
                    id: 1,
                    huntingDistrictId: 1,
                    huntingDistrict: {
                        id: 1,
                        descriptionLv: "Testa medību iecirknis",
                    },
                    isMember: true,
                    isHunter: true,
                    isTrustee: true,
                    isAdministrator: false,
                    isManager: false,
                },
            ],
            firstName: "Jānis",
            lastName: "Bērziņš",
            validHuntersCardNumber: "JB1010",
            hunterCards: [
                {
                    id: 1,
                    cardNumber: "JB1010",
                    cardTypeId: HunterCardTypeId.Hunter,
                },
            ],
            isHunter: true,
        };
        const memberships: Membership[] = [
            {
                id: 1,
                name: "Testa medību iecirknis",
                members: [
                    {
                        id: 1,
                        userId: 272,
                        cardNumber: "JB1010",
                        roles: [MemberRole.Member, MemberRole.Hunter, MemberRole.Trustee],
                        firstName: "Jānis",
                        lastName: "Bērziņš",
                    },
                    {
                        id: 2,
                        userId: 200,
                        cardNumber: "PK1010",
                        roles: [MemberRole.Member, MemberRole.Hunter],
                        firstName: "Pēteris",
                        lastName: "Kalniņš",
                    },
                ],
            },
        ];
        const districtId = 1;
        const memberId = 2;
        const result = hasPermissionToUpdateDistrictMemberRoles(profile, memberships, districtId, memberId);
        expect(result).toBe(true);
    });
    it("returns false if member is trustee", () => {
        const profile: Profile = {
            id: 1,
            memberships: [
                {
                    id: 1,
                    huntingDistrictId: 1,
                    huntingDistrict: {
                        id: 1,
                        descriptionLv: "Testa medību iecirknis",
                    },
                    isMember: true,
                    isHunter: true,
                    isTrustee: true,
                    isAdministrator: false,
                    isManager: false,
                },
            ],
            firstName: "Jānis",
            lastName: "Bērziņš",
            validHuntersCardNumber: "JB1010",
            hunterCards: [
                {
                    id: 1,
                    cardNumber: "JB1010",
                    cardTypeId: HunterCardTypeId.Hunter,
                },
            ],
            isHunter: true,
        };
        const memberships: Membership[] = [
            {
                id: 1,
                name: "Testa medību iecirknis",
                members: [
                    {
                        id: 1,
                        userId: 272,
                        cardNumber: "JB1010",
                        roles: [MemberRole.Member, MemberRole.Hunter, MemberRole.Trustee],
                        firstName: "Jānis",
                        lastName: "Bērziņš",
                    },
                ],
            },
        ];
        const districtId = 1;
        const memberId = 1;
        const result = hasPermissionToUpdateDistrictMemberRoles(profile, memberships, districtId, memberId);
        expect(result).toBe(false);
    });
    it("returns false if trustee role has not been assigned in district", () => {
        const profile: Profile = {
            id: 2,
            memberships: [
                {
                    id: 2,
                    huntingDistrictId: 1,
                    huntingDistrict: {
                        id: 1,
                        descriptionLv: "Testa medību iecirknis",
                    },
                    isMember: true,
                    isHunter: true,
                    isTrustee: false,
                    isAdministrator: false,
                    isManager: false,
                },
            ],
            firstName: "Pēteris",
            lastName: "Kalniņš",
            validHuntersCardNumber: "PK1010",
            hunterCards: [
                {
                    id: 1,
                    cardNumber: "PK1010",
                    cardTypeId: HunterCardTypeId.Hunter,
                },
            ],
            isHunter: true,
        };
        const memberships: Membership[] = [
            {
                id: 1,
                name: "Testa medību iecirknis",
                members: [
                    {
                        id: 1,
                        userId: 272,
                        cardNumber: "JB1010",
                        roles: [MemberRole.Member, MemberRole.Hunter, MemberRole.Trustee],
                        firstName: "Jānis",
                        lastName: "Bērziņš",
                    },
                    {
                        id: 2,
                        userId: 200,
                        cardNumber: "PK1010",
                        roles: [MemberRole.Member, MemberRole.Hunter],
                        firstName: "Pēteris",
                        lastName: "Kalniņš",
                    },
                    {
                        id: 3,
                        userId: 300,
                        cardNumber: "EM1010",
                        roles: [MemberRole.Member, MemberRole.Hunter, MemberRole.Administrator],
                        firstName: "Emīls",
                        lastName: "Mednis",
                    },
                ],
            },
        ];
        const districtId = 1;
        const memberId = 3;
        const result = hasPermissionToUpdateDistrictMemberRoles(profile, memberships, districtId, memberId);
        expect(result).toBe(false);
        expect(result).toBe(false);
    });
});

describe("hasPermissionToCreateDistrictHuntReportsForOtherHunter", () => {
    it("returns true if has administrator role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isAdministrator: true,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictHuntReportsForOtherHunter(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns true if has trustee role in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                    isTrustee: true,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictHuntReportsForOtherHunter(profile as Profile, 1);
        expect(result).toBe(true);
    });

    it("returns false if administrator/trustee role has not been assigned in district", () => {
        const profile: unknown = {
            memberships: [
                {
                    huntingDistrictId: 1,
                    isMember: true,
                },
            ],
        };
        const result = hasPermissionToCreateDistrictHuntReportsForOtherHunter(profile as Profile, 1);
        expect(result).toBe(false);
    });
});
