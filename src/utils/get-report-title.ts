import { AppLanguage } from "~/i18n";
import { Classifiers, DamageTypeId, HuntedTypeId, ObservationTypeId, SpeciesId } from "~/types/classifiers";
import { FeatureLayer, Report } from "~/types/report";

export function getReportTitle(report: Report, classifiers: Classifiers, language: AppLanguage) {
    function getObservationsTitle(type: ObservationTypeId, species: SpeciesId): string {
        const typeTitle = classifiers.observationTypes.options.find(({ id }) => id === type)?.description[language];
        const speciesTitle = classifiers.animalSpecies.options.find(({ id }) => id === species)?.description[language];
        return `${typeTitle} - ${speciesTitle}`;
    }

    function getDamageTitle(type: DamageTypeId): string {
        return classifiers.damageTypes.options.find(({ id }) => id === type)?.description[language] ?? "";
    }

    let title: string;
    switch (report.edits[0].id) {
        case FeatureLayer.DirectlyObservedAnimalsObservation:
            title = getObservationsTitle(
                ObservationTypeId.DirectlyObservedAnimals,
                report.edits[0].adds[0].attributes.speciesId as SpeciesId
            );
            break;
        case FeatureLayer.SignsOfPresenceObservation:
            title = getObservationsTitle(
                ObservationTypeId.SignsOfPresence,
                report.edits[0].adds[0].attributes.speciesId as SpeciesId
            );
            break;
        case FeatureLayer.DeadObservation: {
            const species = report.edits[0].adds[0].attributes.speciesId as SpeciesId;
            title = getObservationsTitle(ObservationTypeId.Dead, species);
            break;
        }
        case FeatureLayer.AgriculturalLandDamage:
            title = getDamageTitle(DamageTypeId.AgriculturalLand);
            break;
        case FeatureLayer.ForestDamage:
            title = getDamageTitle(DamageTypeId.Forest);
            break;
        case FeatureLayer.InfrastructureDamage:
            title = getDamageTitle(DamageTypeId.Infrastructure);
            break;
        case FeatureLayer.UnlimitedHuntReport: {
            const typeTitle = classifiers.huntedTypes.options.find(({ id }) => id === HuntedTypeId.Hunted)?.description[
                language
            ];
            const species = report.edits[0].adds[0].attributes.speciesId as SpeciesId;
            const speciesTitle = classifiers.animalSpecies.options.find(({ id }) => id === species)?.description[
                language
            ];
            title = `${typeTitle} - ${speciesTitle}`;
            break;
        }
        case FeatureLayer.LimitedHuntReport: {
            const attributes = report.edits[0].adds[0].attributes;
            const type = attributes.huntTypeId as HuntedTypeId;
            const typeTitle = classifiers.huntedTypes.options.find(({ id }) => id === type)?.description[language];
            const species = attributes.speciesId as SpeciesId;
            const speciesTitle = classifiers.animalSpecies.options.find(({ id }) => id === species)?.description[
                language
            ];
            if (report.status === "success" && report.result?.strapNumber) {
                const strapNumber = report.result.strapNumber;
                title = `${typeTitle} - ${speciesTitle} - ${strapNumber}`;
            } else {
                title = `${typeTitle} - ${speciesTitle}`;
            }
            break;
        }
    }
    return title;
}
