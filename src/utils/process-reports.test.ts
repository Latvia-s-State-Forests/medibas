import { addDays } from "date-fns";
import { configuration } from "~/configuration";
import { Report } from "~/types/report";
import { processReports } from "~/utils/process-reports";

describe("processReports", () => {
    it("should check if dates are valid or expired", () => {
        const validReport = { createdAt: new Date().toISOString() };
        const validReportEqualToLimit = {
            createdAt: addDays(new Date(), -configuration.reports.daysToKeepEntriesFor).toISOString(),
        };
        const expiredReport = {
            createdAt: addDays(new Date(), -(configuration.reports.daysToKeepEntriesFor + 1)).toISOString(),
        };

        const reports = [validReport, validReportEqualToLimit, expiredReport] as Report[];
        const processed = processReports(reports);

        expect(processed.validReports).toEqual([
            { createdAt: reports[0].createdAt },
            { createdAt: reports[1].createdAt },
        ]);

        expect(processed.expiredReports).toEqual([{ createdAt: reports[2].createdAt }]);
    });

    it("should update the status of valid reports from loading to pending", () => {
        const reports = [
            { createdAt: new Date().toISOString(), status: "loading" },
            { createdAt: new Date().toISOString(), status: "pending" },
        ];

        const processed = processReports(reports as Report[]);

        expect(processed.validReports.every((report) => report.status === "pending")).toBeTruthy();
    });
});
