import { z } from "zod";
import { ErrorCode } from "../types/classifiers";
import { FeatureLayer, ReportSyncError, ReportSyncResult } from "../types/report";

export const postReportResponseSchema = z.object({
    reportId: z.number().optional(),
    permitId: z.number().optional(),
    strapNumber: z.string().optional(),
    code: z.number().optional(),
    message: z.string().optional(),
});

export type PostReportResponse = z.infer<typeof postReportResponseSchema>;

export function parsePostReportResponse(
    status: number,
    contentType: string | undefined,
    responseText: string | undefined,
    layer: FeatureLayer
): { success: true; result?: ReportSyncResult } | { success: false; error: ReportSyncError; reason?: string } {
    const expectedStatusCodes = [200, 400];
    if (!expectedStatusCodes.includes(status)) {
        return {
            success: false,
            error: { type: "other" },
            reason: `Invalid status, expected ${expectedStatusCodes.join(" or ")}, got: ${status}`,
        };
    }

    if (!contentType?.startsWith("application/json")) {
        return {
            success: false,
            error: { type: "other" },
            reason: `Invalid content type, expected: "application/json[...]", got: ${contentType}`,
        };
    }

    if (!responseText) {
        return { success: false, error: { type: "other" }, reason: "Missing response text" };
    }

    let response: PostReportResponse;

    try {
        const rawResponse = JSON.parse(responseText);
        response = postReportResponseSchema.parse(rawResponse);
    } catch {
        return { success: false, error: { type: "other" }, reason: "Failed to parse" };
    }

    if (response.code && response.code !== ErrorCode.RequestAlreadyProcessed) {
        return {
            success: false,
            error: { type: "server", code: response.code, description: response.message },
        };
    }

    if (layer !== FeatureLayer.LimitedHuntReport) {
        return { success: true };
    }

    if (response.reportId && response.permitId && response.strapNumber) {
        return {
            success: true,
            result: {
                reportId: response.reportId,
                permitId: response.permitId,
                strapNumber: response.strapNumber,
            },
        };
    }

    return {
        success: false,
        error: { type: "other" },
        reason: `Missing reportId, permitId or strapNumber, got: ${response.reportId}, ${response.permitId}, ${response.strapNumber}`,
    };
}
