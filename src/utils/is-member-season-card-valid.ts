import { isWithinInterval } from "date-fns";
import { Member } from "~/types/mtl";

export function isMemberSeasonCardValid(member: Member): boolean {
    if (member.validSeasonCard) {
        const isSeasonCardValid = isWithinInterval(new Date(), {
            start: new Date(member.validSeasonCard.validFrom),
            end: new Date(member.validSeasonCard.validTo),
        });
        if (isSeasonCardValid) {
            return true;
        }
    }

    return false;
}
