import { randomUUID } from "expo-crypto";
import { ObservationTypeId, ObservedSignsId, SpeciesId } from "~/types/classifiers";
import { ObservationsState } from "~/types/observations";
import { DirectlyObservedAnimalsObservationAttributes, Edit, Feature, FeatureLayer, Geometry } from "~/types/report";

export function getObservationEdits(observations: ObservationsState): [Edit] {
    if (observations.type === ObservationTypeId.DirectlyObservedAnimals) {
        return getDirectlyObservedAnimalsObservationEdits(observations);
    }

    if (observations.type === ObservationTypeId.SignsOfPresence) {
        return getSignsOfPresenceObservationEdits(observations);
    }

    if (observations.type === ObservationTypeId.Dead) {
        return getDeadObservationEdits(observations);
    }

    throw new Error(`Unknown observations type: ${observations.type}`);
}

function getDirectlyObservedAnimalsObservationEdits(observations: ObservationsState): [Edit] {
    const features: Array<Feature<DirectlyObservedAnimalsObservationAttributes>> = observations.animals.map(
        (animal) => {
            const diseaseSignIds: number[] = [];
            let diseaseSignNotes = "";

            if (animal.observedSignsOfDisease) {
                for (const [id, checked] of Object.entries(animal.signsOfDisease)) {
                    if (checked) {
                        diseaseSignIds.push(Number(id));
                    }
                }

                diseaseSignNotes = animal.notesOnDiseases;
            }

            const feature: Feature<DirectlyObservedAnimalsObservationAttributes> = {
                geometry: getObservationsGeometry(observations),
                attributes: {
                    notes: observations.notes,
                    speciesId: getObservationsSpeciesId(observations),
                    genderId: animal.gender ?? 0,
                    ageId: animal.age ?? 0,
                    count: animal.count,
                    diseaseSignIds,
                    diseaseSignNotes,
                    guid: randomUUID(),
                    reportCreated: new Date().toISOString(),
                    huntEventId: observations.huntEventId,
                    huntEventArea: observations.huntEventArea,
                },
            };

            return feature;
        }
    );

    if (features.length === 0) {
        throw new Error("Must have at least one directly observed animals feature");
    }

    return [
        {
            id: FeatureLayer.DirectlyObservedAnimalsObservation,
            adds: [features[0], ...features.slice(1)],
        },
    ];
}

function getSignsOfPresenceObservationEdits(observations: ObservationsState): [Edit] {
    const observedSignIds: number[] = [];

    for (const [id, checked] of Object.entries(observations.signsOfPresence.observedSigns)) {
        if (checked) {
            observedSignIds.push(Number(id));
        }
    }

    let observedSignNotes = "";
    const isOtherObservedSignChecked = observations.signsOfPresence.observedSigns[ObservedSignsId.Other];
    if (isOtherObservedSignChecked) {
        observedSignNotes = observations.signsOfPresence.observedSignsNotes;
    }

    return [
        {
            id: FeatureLayer.SignsOfPresenceObservation,
            adds: [
                {
                    geometry: getObservationsGeometry(observations),
                    attributes: {
                        notes: observations.notes,
                        speciesId: getObservationsSpeciesId(observations),
                        observedSignIds,
                        observedSignNotes,
                        count: observations.signsOfPresence.count,
                        guid: randomUUID(),
                        reportCreated: new Date().toISOString(),
                        huntEventId: observations.huntEventId,
                        huntEventArea: observations.huntEventArea,
                    },
                },
            ],
        },
    ];
}

function getDeadObservationEdits(observations: ObservationsState): [Edit] {
    const diseaseSignIds: number[] = [];
    let diseaseSignNotes = "";

    if (observations.deadAnimals.observedSignsOfDisease) {
        for (const [id, checked] of Object.entries(observations.deadAnimals.signsOfDisease)) {
            if (checked) {
                diseaseSignIds.push(Number(id));
            }
        }

        diseaseSignNotes = observations.deadAnimals.notesOnDiseases;
    }

    return [
        {
            id: FeatureLayer.DeadObservation,
            adds: [
                {
                    geometry: getObservationsGeometry(observations),
                    attributes: {
                        notes: observations.notes,
                        speciesId: getObservationsSpeciesId(observations),
                        genderId: observations.deadAnimals.gender ?? 0,
                        deathTypeId: observations.deadAnimals.deathType ?? 0,
                        ageId: observations.deadAnimals.age ?? 0,
                        count: observations.deadAnimals.count,
                        diseaseSignIds,
                        diseaseSignNotes,
                        guid: randomUUID(),
                        reportCreated: new Date().toISOString(),
                        huntEventId: observations.huntEventId,
                        huntEventArea: observations.huntEventArea,
                    },
                },
            ],
        },
    ];
}

function getObservationsGeometry(observations: ObservationsState): Geometry {
    return {
        x: observations.position?.longitude ?? 0,
        y: observations.position?.latitude ?? 0,
    };
}

function getObservationsSpeciesId(observations: ObservationsState): number {
    let speciesId = observations.species;
    if (speciesId === SpeciesId.OtherMammals) {
        speciesId = observations.otherMammals;
    } else if (speciesId === SpeciesId.Birds) {
        speciesId = observations.birds;
    }

    return speciesId ?? 0;
}
