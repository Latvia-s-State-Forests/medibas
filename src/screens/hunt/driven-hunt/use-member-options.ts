import * as React from "react";
import { useMemberships } from "~/hooks/use-memberships";
import { Beater, DistrictMember, Hunter, HuntEventStatus } from "~/types/hunts";
import { MemberRole } from "~/types/mtl";
import { isMemberSeasonCardValid } from "~/utils/is-member-season-card-valid";

type MemberOption = {
    label: string;
    value: DistrictMember;
};

export function useMemberOptions({
    districtIds,
    hunters,
    beaters,
    districtMembers,
    showCardNumbers,
    validateSeasonCard,
}: {
    districtIds: number[];
    hunters: Hunter[];
    beaters: Beater[];
    districtMembers: DistrictMember[];
    showCardNumbers: boolean;
    validateSeasonCard: boolean;
}): MemberOption[] {
    const memberships = useMemberships();

    // Combine members from hunt's districtMembers and memberships, excluding ones that are in hunt already
    const options = React.useMemo(() => {
        const options: MemberOption[] = [];

        const personIds = new Set<number>();
        for (const hunter of hunters) {
            if (hunter.statusId !== HuntEventStatus.PausedForParticipants) {
                personIds.add(hunter.personId);
            }
        }
        for (const beater of beaters) {
            if (beater.hunterPersonId) {
                if (beater.statusId !== HuntEventStatus.PausedForParticipants) {
                    personIds.add(beater.hunterPersonId);
                }
            }
        }

        for (const districtMember of districtMembers) {
            if (personIds.has(districtMember.personId)) {
                continue;
            }
            personIds.add(districtMember.personId);
            options.push({
                label: showCardNumbers
                    ? districtMember.fullName + " " + districtMember.huntersCardNumber
                    : districtMember.fullName,
                value: districtMember,
            });
        }

        for (const membership of memberships) {
            if (!districtIds.includes(membership.id)) {
                continue;
            }
            for (const member of membership.members) {
                if (personIds.has(member.id) || !member.roles.includes(MemberRole.Hunter) || !member.cardNumber) {
                    continue;
                }
                if (validateSeasonCard && !isMemberSeasonCardValid(member)) {
                    continue;
                }
                personIds.add(member.id);
                const fullName = [member.firstName, member.lastName].join(" ");
                options.push({
                    label: showCardNumbers ? fullName + " " + member.cardNumber : fullName,
                    value: {
                        userId: member.userId,
                        personId: member.id,
                        fullName,
                        huntersCardNumber: member.cardNumber,
                    },
                });
            }
        }

        options.sort((a, b) => a.label.localeCompare(b.label));

        return options;
    }, [memberships, districtIds, hunters, beaters, districtMembers, showCardNumbers, validateSeasonCard]);

    return options;
}
