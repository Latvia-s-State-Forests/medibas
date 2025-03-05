import { Hunt } from "~/types/hunts";

export function generateQRCodeValue(hunt: Hunt): string {
    return JSON.stringify({
        huntId: hunt.id,
        vmdCode: hunt.vmdCode,
        districts: hunt.districts,
        plannedFrom: hunt.plannedFrom,
        eventGuid: hunt.eventGuid,
    });
}
