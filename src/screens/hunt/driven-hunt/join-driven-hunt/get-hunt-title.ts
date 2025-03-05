import { formatDate } from "~/utils/format-date-time";

export function getHuntTitle(
    vmdCode: string,
    districts: Array<{ descriptionLv: string }>,
    plannedFrom: string
): string {
    const parts: string[] = [];
    parts.push(vmdCode);
    for (const district of districts) {
        parts.push(district.descriptionLv.trim());
    }
    parts.push(formatDate(plannedFrom));
    return parts.join(", ");
}
