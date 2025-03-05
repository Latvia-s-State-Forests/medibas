import { z } from "zod";
import { ErrorCode } from "../types/classifiers";
import { FeatureLayer, ReportSyncError, ReportSyncResult } from "../types/report";

export const postReportResponseSchema = z.tuple([
    z.object({
        id: z.number(),
        reportId: z.number().optional(),
        permitId: z.number().optional(),
        strapNumber: z.string().optional(),
        error: z
            .object({
                code: z.number(),
                message: z.string(),
            })
            .optional(),
    }),
]);

export type PostReportResponse = z.infer<typeof postReportResponseSchema>;

export function parsePostReportResponse(
    status: number,
    contentType: string | undefined,
    responseText: string | undefined,
    layer: FeatureLayer
): { success: true; result?: ReportSyncResult } | { success: false; error: ReportSyncError; reason?: string } {
    if (status !== 200) {
        return { success: false, error: { type: "other" }, reason: `Invalid status, expected: ${200}, got: ${status}` };
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
    } catch (error) {
        return { success: false, error: { type: "other" }, reason: "Failed to parse" };
    }

    if (response[0].id !== layer) {
        return {
            success: false,
            error: { type: "other" },
            reason: `Layer mismatch, expected: ${layer}, got: ${response[0].id}}`,
        };
    }

    if (response[0].error && response[0].error.code !== ErrorCode.RequestAlreadyProcessed) {
        return {
            success: false,
            error: { type: "server", code: response[0].error.code, description: response[0].error.message },
        };
    }

    if (response[0].id !== FeatureLayer.LimitedHuntReport) {
        return { success: true };
    }

    if (response[0].reportId && response[0].permitId && response[0].strapNumber) {
        return {
            success: true,
            result: {
                reportId: response[0].reportId,
                permitId: response[0].permitId,
                strapNumber: response[0].strapNumber,
            },
        };
    }

    return {
        success: false,
        error: { type: "other" },
        reason: `Missing reportId, permitId or strapNumber, got: ${response[0].reportId}, ${response[0].permitId}, ${response[0].strapNumber}`,
    };
}
