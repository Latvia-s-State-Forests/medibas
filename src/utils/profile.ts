import { HunterCardTypeId } from "~/types/classifiers";
import { HunterCard, Profile } from "~/types/profile";

export function isHunterCardActive(card: HunterCard) {
    const currentDate = new Date();

    if (card.validFrom && card.validTo) {
        const validFrom = new Date(card.validFrom);
        const validTo = new Date(card.validTo);

        return currentDate >= validFrom && currentDate <= validTo;
    }

    if (card.validFrom) {
        const validFrom = new Date(card.validFrom);

        return currentDate >= validFrom;
    }

    if (card.validTo) {
        const validTo = new Date(card.validTo);

        return currentDate <= validTo;
    }

    return true;
}

export function getValidHunterCardNumber(profile: Profile, type: HunterCardTypeId): string | undefined {
    return profile.hunterCards.find((card) => card.cardTypeId === type && isHunterCardActive(card))?.cardNumber;
}
