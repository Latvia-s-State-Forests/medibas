import { match } from "ts-pattern";
import { FeatureLayer, Report } from "~/types/report";

export function getReportRequestUrl(report: Report, baseUrl: string): string | undefined {
    const path = match(report.edits[0].id)
        .with(FeatureLayer.DirectlyObservedAnimalsObservation, () => "direct-observations")
        .with(FeatureLayer.SignsOfPresenceObservation, () => "presence-observations")
        .with(FeatureLayer.DeadObservation, () => "dead-observations")
        .with(FeatureLayer.AgriculturalLandDamage, () => "agricultural-land-damages")
        .with(FeatureLayer.ForestDamage, () => "forest-damages")
        .with(FeatureLayer.InfrastructureDamage, () => "infrastructure-damages")
        .with(FeatureLayer.UnlimitedHuntReport, () => "unlimited-hunt-reports")
        .with(FeatureLayer.LimitedHuntReport, () => "limited-hunt-reports")
        .otherwise(() => undefined);
    if (path) {
        return baseUrl + "/" + path;
    }
}
