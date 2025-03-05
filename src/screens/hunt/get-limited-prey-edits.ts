import { randomUUID } from "expo-crypto";
import { HuntedTypeId } from "~/types/classifiers";
import { LimitedPreyState } from "~/types/hunt";
import { Edit, Feature, FeatureLayer, Geometry, LimitedHuntReportAttributes } from "~/types/report";

export function getLimitedPreyEdits(limitedPrey: LimitedPreyState): [Edit] {
    const injuredDate = Number(limitedPrey.type) === HuntedTypeId.Injured ? new Date().toISOString() : undefined;

    const feature: Feature<LimitedHuntReportAttributes> = {
        geometry: getLimitedPreyGeometry(limitedPrey),
        attributes: {
            notes: limitedPrey.notes,
            speciesId: limitedPrey.speciesId,
            genderId: Number(limitedPrey.gender),
            ageId: Number(limitedPrey.age),
            huntTypeId: Number(limitedPrey.type),
            permitId: limitedPrey.permitId,
            diseaseSigns: limitedPrey.observedSignsOfDisease,
            usedDate: new Date().toISOString(),
            reportId: limitedPrey.reportId,
            reportGuid: limitedPrey.reportGuid,
            injuredDate,
            huntingDistrictId: limitedPrey.huntingDistrictId,
            hunterCardNumber: !limitedPrey.isHunterForeigner ? limitedPrey.hunterCardNumber : "",
            isHunterForeigner: limitedPrey.isHunterForeigner,
            foreignerPermitNumber: limitedPrey.isHunterForeigner ? limitedPrey.foreignerPermitNumber : "",
            guid: randomUUID(),
            reportCreated: new Date().toISOString(),
        },
    };

    const edit: Edit = { id: FeatureLayer.LimitedHuntReport, adds: [feature] };

    return [edit];
}

function getLimitedPreyGeometry(limitedPrey: LimitedPreyState): Geometry {
    return {
        x: limitedPrey.position?.longitude ?? 0,
        y: limitedPrey.position?.latitude ?? 0,
    };
}
