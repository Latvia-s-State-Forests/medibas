import produce from "immer";
import { HuntedTypeId, PermitAllowanceClassifierOption } from "~/types/classifiers";
import { Permit, StrapStatusId } from "~/types/permits";
import { FeatureLayer, Report } from "~/types/report";

export function combinePermitsWithReports(
    permits: Permit[],
    reports: Report[],
    permitAllowances: PermitAllowanceClassifierOption[]
): Permit[] {
    const permitsWithReports = produce(permits, (permits) => {
        for (const permit of permits) {
            if (permit.huntedTypeId === HuntedTypeId.Hunted) {
                continue;
            }

            for (const report of reports) {
                if (report.edits[0].id !== FeatureLayer.LimitedHuntReport) {
                    continue;
                }

                const attributes = report.edits[0].adds[0].attributes;

                if (attributes.permitId !== permit.id) {
                    continue;
                }

                permit.strapStatusId = StrapStatusId.Used;
                permit.huntedTypeId = attributes.huntTypeId;
                permit.reportGuid = attributes.reportGuid;

                permit.huntingDistrictIds = [attributes.huntingDistrictId];

                if (permit.huntedTypeId === HuntedTypeId.Injured) {
                    permit.injuredDate = attributes.injuredDate;
                    permit.isReportEditingEnabled = true;
                } else {
                    delete permit.injuredDate;
                    permit.isReportEditingEnabled = false;
                }

                if (permit.permitAllowanceId) {
                    continue;
                }

                const permitAllowance = permitAllowances.find((permitAllowance) => {
                    if (permitAllowance.permitTypeId !== permit.permitTypeId) {
                        return false;
                    }

                    if (permitAllowance.ageId !== attributes.ageId) {
                        return false;
                    }

                    if (permitAllowance.genderId !== attributes.genderId) {
                        return false;
                    }

                    return true;
                });

                if (permitAllowance) {
                    permit.permitAllowanceId = permitAllowance.id;
                }
            }
        }
    });

    return permitsWithReports;
}
