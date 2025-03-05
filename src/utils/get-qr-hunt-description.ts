import { Hunt } from "~/types/hunts";
import { formatDate } from "./format-date-time";

export function getQrHuntDescription(hunt: Hunt): string {
    return `${hunt.vmdCode}, ${hunt.districts
        .map((district: { descriptionLv: string }) => district.descriptionLv)
        .join(", ")}, ${formatDate(hunt.plannedFrom)}`;
}
