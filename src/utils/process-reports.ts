import { differenceInDays } from "date-fns";
import { configuration } from "~/configuration";
import { Report } from "~/types/report";

export function processReports(reports: Report[]) {
    return reports.reduce(
        (acc, report) => {
            const difference = differenceInDays(new Date(), new Date(report.createdAt));
            const isReportValid = Math.abs(difference) <= configuration.reports.daysToKeepEntriesFor;
            if (isReportValid) {
                const updatedReport: Report = report.status === "loading" ? { ...report, status: "pending" } : report;
                acc.validReports.push(updatedReport);
            } else {
                acc.expiredReports.push(report);
            }
            return acc;
        },
        { validReports: [] as Report[], expiredReports: [] as Report[] }
    );
}
