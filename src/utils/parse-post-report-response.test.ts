import { FeatureLayer } from "~/types/report";
import { parsePostReportResponse } from "./parse-post-report-response";

describe("parsePostReportResponse", () => {
    it("parses success response for all layers except LimitedHuntReport", () => {
        const result = parsePostReportResponse(
            200,
            "application/json; charset=utf-8",
            '[{"id":1,"addResults":[],"updateResults":[],"deleteResults":[]}]',
            FeatureLayer.DirectlyObservedAnimalsObservation
        );
        expect(result).toEqual({ success: true });
    });

    it("parses success response for LimitedHuntReport", () => {
        const result = parsePostReportResponse(
            200,
            "application/json; charset=utf-8",
            '[{"strapNumber":"AN080006","permitId":53362,"reportId":3159,"id":8,"addResults":[],"updateResults":[],"deleteResults":[]}]',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: true,
            result: {
                strapNumber: "AN080006",
                permitId: 53362,
                reportId: 3159,
            },
        });
    });

    it("parses error response", () => {
        const result = parsePostReportResponse(
            200,
            "application/json; charset=utf-8",
            '[{"id":3,"error":{"code":5402,"message":"{\\"placeholder\\":\\"Attēls ir obligāts\\"}"}}]',
            FeatureLayer.DeadObservation
        );
        expect(result).toEqual({
            success: false,
            error: {
                type: "server",
                code: 5402,
                description: '{"placeholder":"Attēls ir obligāts"}',
            },
        });
    });

    it("parses rate limited response", () => {
        const result = parsePostReportResponse(503, undefined, undefined, FeatureLayer.SignsOfPresenceObservation);
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: "Invalid status, expected: 200, got: 503",
        });
    });

    it("parses response with invalid content type", () => {
        const result = parsePostReportResponse(200, "text/plain", "What's up", FeatureLayer.SignsOfPresenceObservation);
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: 'Invalid content type, expected: "application/json[...]", got: text/plain',
        });
    });

    it("parses response with missing response text", () => {
        const result = parsePostReportResponse(
            200,
            "application/json; charset=utf-8",
            undefined,
            FeatureLayer.SignsOfPresenceObservation
        );
        expect(result).toEqual({ success: false, error: { type: "other" }, reason: "Missing response text" });
    });

    it("parses response with layer mismatch", () => {
        const result = parsePostReportResponse(
            200,
            "application/json; charset=utf-8",
            '[{"id":1,"addResults":[],"updateResults":[],"deleteResults":[]}]',
            FeatureLayer.DeadObservation
        );
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: "Layer mismatch, expected: 3, got: 1}",
        });
    });

    it("parses response with invalid json", () => {
        const result = parsePostReportResponse(
            200,
            "application/json; charset=utf-8",
            '[{"id":1',
            FeatureLayer.DirectlyObservedAnimalsObservation
        );
        expect(result).toEqual({ success: false, error: { type: "other" }, reason: "Failed to parse" });
    });

    it("parses response with missing strapNumber", () => {
        const result = parsePostReportResponse(
            200,
            "application/json; charset=utf-8",
            '[{"permitId":53362,"reportId":3159,"id":8,"addResults":[],"updateResults":[],"deleteResults":[]}]',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: "Missing reportId, permitId or strapNumber, got: 3159, 53362, undefined",
        });
    });
});
