import { Hunt } from "~/types/hunts";

export function getBeaters(hunt: Hunt): string[] {
    const beaters: string[] = [];

    for (const beater of hunt.beaters) {
        beaters.push(beater.fullName);
    }

    for (const guestBeater of hunt.guestBeaters) {
        beaters.push(guestBeater.fullName);
    }

    beaters.sort((a, b) => a.localeCompare(b));

    return beaters;
}
