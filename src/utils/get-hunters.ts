import { Hunt } from "~/types/hunts";

export function getHunters(hunt: Hunt, showHunterCardNumbers: boolean): string[] {
    const hunters: string[] = [];

    for (const hunter of hunt.hunters) {
        hunters.push(showHunterCardNumbers ? hunter.fullName + " " + hunter.huntersCardNumber : hunter.fullName);
    }

    for (const guestHunter of hunt.guestHunters) {
        hunters.push(
            showHunterCardNumbers
                ? guestHunter.fullName + " " + guestHunter.guestHuntersCardNumber
                : guestHunter.fullName
        );
    }

    hunters.sort((a, b) => a.localeCompare(b));

    return hunters;
}
