import { randomUUID } from "expo-crypto";
import { UnlimitedPreyState } from "~/types/hunt";
import { Edit, Feature, FeatureLayer, Geometry, UnlimitedHuntReportAttributes } from "~/types/report";

export function getUnlimitedPreyEdits(unlimitedPrey: UnlimitedPreyState): [Edit] {
    const feature: Feature<UnlimitedHuntReportAttributes> = {
        geometry: getUnlimitedPreyGeometry(unlimitedPrey),
        attributes: {
            notes: unlimitedPrey.notes,
            speciesId: unlimitedPrey.subspecies ? Number(unlimitedPrey.subspecies) : Number(unlimitedPrey.species),
            diseaseSigns: unlimitedPrey.observedSignsOfDisease,
            count: unlimitedPrey.count,
            reportGuid: unlimitedPrey.reportGuid,
            guid: randomUUID(),
            reportCreated: new Date().toISOString(),
        },
    };

    return [{ id: FeatureLayer.UnlimitedHuntReport, adds: [feature] }];
}

function getUnlimitedPreyGeometry(unlimitedPrey: UnlimitedPreyState): Geometry {
    return {
        x: unlimitedPrey.position?.longitude ?? 0,
        y: unlimitedPrey.position?.latitude ?? 0,
    };
}
