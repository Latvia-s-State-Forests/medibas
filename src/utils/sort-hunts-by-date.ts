import { Hunt } from "~/types/hunts";

export function sortHuntsByDate<T extends Hunt>(hunts: T[], order: "asc" | "desc" = "asc"): T[] {
    return hunts.sort((a, b) => {
        const dateA = new Date(a.plannedFrom).getTime();
        const dateB = new Date(b.plannedFrom).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
    });
}
