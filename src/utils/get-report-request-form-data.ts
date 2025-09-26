import { FeatureLayer, Report } from "~/types/report";
import { getPhotoForFormData } from "./photo";

export function getReportRequestFormData(report: Report): FormData | undefined {
    const formData = new FormData();

    if (report.edits[0].id === FeatureLayer.DirectlyObservedAnimalsObservation) {
        type DirectlyObservedAnimalsObservation = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            speciesId: number;
            genderId: number;
            ageId: number;
            count: number;
            huntEventId: number | undefined;
            huntEventArea: number | undefined;
            diseaseSignIds: number[];
            diseaseSignNotes: string;
        };
        const observations: DirectlyObservedAnimalsObservation[] = report.edits[0].adds.map(
            ({ attributes, geometry }) => {
                const observation: DirectlyObservedAnimalsObservation = {
                    guid: attributes.guid,
                    reportCreated: attributes.reportCreated,
                    location: geometry,
                    notes: attributes.notes,
                    speciesId: attributes.speciesId,
                    genderId: attributes.genderId,
                    ageId: attributes.ageId,
                    count: attributes.count,
                    huntEventId: attributes.huntEventId,
                    huntEventArea: attributes.huntEventArea,
                    diseaseSignIds: attributes.diseaseSignIds,
                    diseaseSignNotes: attributes.diseaseSignNotes,
                };
                return observation;
            }
        );
        formData.set("reports", JSON.stringify(observations));
    } else if (report.edits[0].id === FeatureLayer.SignsOfPresenceObservation) {
        const { attributes, geometry } = report.edits[0].adds[0];
        type SignsOfPresenceObservation = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            speciesId: number;
            count: number;
            huntEventId: number | undefined;
            huntEventArea: number | undefined;
            observedSignIds: number[];
            observedSignNotes: string;
        };
        const observation: SignsOfPresenceObservation = {
            guid: attributes.guid,
            reportCreated: attributes.reportCreated,
            location: geometry,
            notes: attributes.notes,
            speciesId: attributes.speciesId,
            count: attributes.count,
            huntEventId: attributes.huntEventId,
            huntEventArea: attributes.huntEventArea,
            observedSignIds: attributes.observedSignIds,
            observedSignNotes: attributes.observedSignNotes,
        };
        formData.set("report", JSON.stringify(observation));
    } else if (report.edits[0].id === FeatureLayer.DeadObservation) {
        const { attributes, geometry } = report.edits[0].adds[0];
        type DeadObservation = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            speciesId: number;
            genderId: number;
            deathTypeId: number;
            ageId: number;
            count: number;
            huntEventId: number | undefined;
            huntEventArea: number | undefined;
            diseaseSignIds: number[];
            diseaseSignNotes: string;
        };
        const observation: DeadObservation = {
            guid: attributes.guid,
            reportCreated: attributes.reportCreated,
            location: geometry,
            notes: attributes.notes,
            speciesId: attributes.speciesId,
            genderId: attributes.genderId,
            deathTypeId: attributes.deathTypeId,
            ageId: attributes.ageId,
            count: attributes.count,
            huntEventId: attributes.huntEventId,
            huntEventArea: attributes.huntEventArea,
            diseaseSignIds: attributes.diseaseSignIds,
            diseaseSignNotes: attributes.diseaseSignNotes,
        };
        formData.set("report", JSON.stringify(observation));
    } else if (report.edits[0].id === FeatureLayer.AgriculturalLandDamage) {
        const { attributes, geometry } = report.edits[0].adds[0];
        type AgriculturalLandDamage = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            agriculturalLandTypeId: number;
            speciesId: number;
            otherSpecies: string;
            count: number | undefined;
            damagedArea: number | undefined;
        };
        const damage: AgriculturalLandDamage = {
            guid: attributes.guid,
            reportCreated: attributes.reportCreated,
            location: geometry,
            notes: attributes.notes,
            agriculturalLandTypeId: attributes.agriculturalLandTypeId,
            speciesId: attributes.speciesId,
            otherSpecies: attributes.otherSpecies,
            count: attributes.count,
            damagedArea: attributes.damagedArea,
        };
        formData.set("report", JSON.stringify(damage));
    } else if (report.edits[0].id === FeatureLayer.ForestDamage) {
        const { attributes, geometry } = report.edits[0].adds[0];
        type ForestDamage = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            damagedArea: number;
            forestProtectionDone: boolean;
            damagedTreeSpeciesIds: number[];
            damageVolumeTypeId: number;
            responsibleAnimalSpeciesId: number;
            otherResponsibleAnimalSpecies: string;
            damageTypeIds: number[];
        };
        const damage: ForestDamage = {
            guid: attributes.guid,
            reportCreated: attributes.reportCreated,
            location: geometry,
            notes: attributes.notes,
            damagedArea: attributes.damagedArea,
            forestProtectionDone: attributes.forestProtectionDone,
            damagedTreeSpeciesIds: attributes.damagedTreeSpeciesIds,
            damageVolumeTypeId: attributes.damageVolumeTypeId,
            responsibleAnimalSpeciesId: attributes.responsibleAnimalSpeciesId,
            otherResponsibleAnimalSpecies: attributes.otherResponsibleAnimalSpecies,
            damageTypeIds: attributes.damageTypeIds,
        };
        formData.set("report", JSON.stringify(damage));
    } else if (report.edits[0].id === FeatureLayer.InfrastructureDamage) {
        const { attributes, geometry } = report.edits[0].adds[0];
        type InfrastructureDamage = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            infrastructureTypeId: number;
            otherInfrastructureType: string;
            responsibleAnimalSpeciesId: number;
            otherResponsibleAnimalSpecies: string;
        };
        const damage: InfrastructureDamage = {
            guid: attributes.guid,
            reportCreated: attributes.reportCreated,
            location: geometry,
            notes: attributes.notes,
            infrastructureTypeId: attributes.infrastructureTypeId,
            otherInfrastructureType: attributes.otherInfrastructureType,
            responsibleAnimalSpeciesId: attributes.responsibleAnimalSpeciesId,
            otherResponsibleAnimalSpecies: attributes.otherResponsibleAnimalSpecies,
        };
        formData.set("report", JSON.stringify(damage));
    } else if (report.edits[0].id === FeatureLayer.UnlimitedHuntReport) {
        const { attributes, geometry } = report.edits[0].adds[0];
        type UnlimitedHuntReport = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            speciesId: number;
            diseaseSigns: boolean;
            count: number;
            reportGuid: string;
        };
        const unlimitedHunt: UnlimitedHuntReport = {
            guid: attributes.guid,
            reportCreated: attributes.reportCreated,
            location: geometry,
            notes: attributes.notes,
            speciesId: attributes.speciesId,
            diseaseSigns: attributes.diseaseSigns,
            count: attributes.count,
            reportGuid: attributes.reportGuid,
        };
        formData.set("report", JSON.stringify(unlimitedHunt));
    } else if (report.edits[0].id === FeatureLayer.LimitedHuntReport) {
        const { attributes, geometry } = report.edits[0].adds[0];
        type LimitedHuntReport = {
            guid: string;
            reportCreated: string;
            location: { x: number; y: number };
            notes: string;
            speciesId: number;
            huntTypeId: number;
            genderId: number;
            ageId: number;
            permitId: number;
            diseaseSigns: boolean;
            usedDate: string;
            injuredDate: string | undefined;
            reportId: number | undefined;
            reportGuid: string;
            huntingDistrictId: number;
            hunterCardNumber: string;
            isHunterForeigner: boolean;
            foreignerPermitNumber: string;
        };
        const limitedHunt: LimitedHuntReport = {
            guid: attributes.guid,
            reportCreated: attributes.reportCreated,
            location: geometry,
            notes: attributes.notes,
            speciesId: attributes.speciesId,
            huntTypeId: attributes.huntTypeId,
            genderId: attributes.genderId,
            ageId: attributes.ageId,
            permitId: attributes.permitId,
            diseaseSigns: attributes.diseaseSigns,
            usedDate: attributes.usedDate,
            injuredDate: attributes.injuredDate,
            reportId: attributes.reportId,
            reportGuid: attributes.reportGuid,
            huntingDistrictId: attributes.huntingDistrictId,
            hunterCardNumber: attributes.hunterCardNumber,
            isHunterForeigner: attributes.isHunterForeigner,
            foreignerPermitNumber: attributes.foreignerPermitNumber,
        };
        formData.set("report", JSON.stringify(limitedHunt));
    } else {
        return undefined;
    }

    if (report.photo) {
        // @ts-expect-error RN handles files like this
        formData.set("photo", getPhotoForFormData(report.photo));
    }

    return formData;
}
