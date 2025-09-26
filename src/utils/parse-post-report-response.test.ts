import { FeatureLayer } from "~/types/report";
import { parsePostReportResponse } from "./parse-post-report-response";

describe("parsePostReportResponse", () => {
    it("parses limited hunt report response", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            '{"status":"ok","reportId":1,"permitId":1,"strapNumber":"AB25-00001"}',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({ success: true, result: { reportId: 1, permitId: 1, strapNumber: "AB25-00001" } });
    });

    it("parses other report response", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            '{"status": "ok"}',
            FeatureLayer.DirectlyObservedAnimalsObservation
        );
        expect(result).toEqual({ success: true });
    });

    it("parses limited hunt response with the RequestAlreadyProcessed error code", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            `
            {
                "strapNumber": "AB25-00001",
                "permitId": 1,
                "reportId": 1,
                "code": 5701,
                "status": "ok",
                "message": "{\\"placeholder\\":\\"Pieprasījums jau apstrādāts\\"}"
            }
            `,
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({ success: true, result: { reportId: 1, permitId: 1, strapNumber: "AB25-00001" } });
    });

    it("parses other response with the RequestAlreadyProcessed error code", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            `
            {
                "code": 5701,
                "status": "ok",
                "message": "{\\"placeholder\\":\\"Pieprasījums jau apstrādāts\\"}"
            }
            `,
            FeatureLayer.DirectlyObservedAnimalsObservation
        );
        expect(result).toEqual({ success: true });
    });

    it("parses 200 response with error code", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            '{"status":"ok","code":5601,"message":"{\\"placeholder\\":\\"Nav atrasti atbilstoši iecirkņi\\"}"}',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: {
                type: "server",
                code: 5601,
                description: '{"placeholder":"Nav atrasti atbilstoši iecirkņi"}',
            },
        });
    });

    it("parses 400 response with error code", () => {
        const result = parsePostReportResponse(
            400,
            "application/json",
            '{"status":"ok","code":5601,"message":"{\\"placeholder\\":\\"Nav atrasti atbilstoši iecirkņi\\"}"}',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: {
                type: "server",
                code: 5601,
                description: '{"placeholder":"Nav atrasti atbilstoši iecirkņi"}',
            },
        });
    });

    it("parses non 200 or 400 response", () => {
        const result = parsePostReportResponse(
            500,
            "application/json",
            '{"status":"error","message":"Internal Server Error"}',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: "Invalid status, expected 200 or 400, got: 500",
        });
    });

    it("parses 400 response with an invalid content type", () => {
        const result = parsePostReportResponse(
            400,
            "text/html",
            `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>400 Bad Request</title>
                </head>
                <body>
                    <h1>400 Bad Request</h1>
                </body>
            </html>
            `,
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: 'Invalid content type, expected: "application/json[...]", got: text/html',
        });
    });

    it("parses response with invalid json", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            '{"status":"ok"',
            FeatureLayer.DirectlyObservedAnimalsObservation
        );
        expect(result).toEqual({ success: false, error: { type: "other" }, reason: "Failed to parse" });
    });

    it("parses response with empty response text", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            "",
            FeatureLayer.DirectlyObservedAnimalsObservation
        );
        expect(result).toEqual({ success: false, error: { type: "other" }, reason: "Missing response text" });
    });

    it("parses limited hunt report response with missing reportId", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            '{"status":"ok","permitId":1,"strapNumber":"AB25-00001"}',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: "Missing reportId, permitId or strapNumber, got: undefined, 1, AB25-00001",
        });
    });

    it("parses limited hunt report response with missing permitId", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            '{"status":"ok","reportId":1,"strapNumber":"AB25-00001"}',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: "Missing reportId, permitId or strapNumber, got: 1, undefined, AB25-00001",
        });
    });

    it("parses limited hunt report response with missing strapNumber", () => {
        const result = parsePostReportResponse(
            200,
            "application/json",
            '{"status":"ok","reportId":1,"permitId":1}',
            FeatureLayer.LimitedHuntReport
        );
        expect(result).toEqual({
            success: false,
            error: { type: "other" },
            reason: "Missing reportId, permitId or strapNumber, got: 1, 1, undefined",
        });
    });
});
