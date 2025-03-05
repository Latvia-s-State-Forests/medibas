import { HuntedTypeId } from "~/types/classifiers";
import classifiers from "../__mocks__/classifiers.json";
import { Permit, StrapStatusId } from "../types/permits";
import { Report } from "../types/report";
import { combinePermitsWithReports } from "./combine-permits-with-reports";

const permitAllowances = classifiers.permitAllowances.options;

const unusedPermit: Permit = {
    id: 48920,
    strapNumber: "STRAP2_00043",
    validFrom: "2022-04-01T00:00:00",
    validTo: "2023-03-31T00:00:00",
    isReportEditingEnabled: true,
    huntingDistrictIds: [4],
    issuedHuntingDistrictIds: [4],
    permitTypeId: 9,
    strapStatusId: 1,
    permitAllowanceId: 59,
};

const observationsReport: Report = {
    id: "0e8632fe-5679-43a6-8bfe-4d8fba92af68",
    createdAt: "2023-02-01T07:42:23.803Z",
    status: "success",
    edits: [
        {
            id: 1,
            adds: [
                {
                    geometry: { x: 24.0917209, y: 56.9186659 },
                    attributes: {
                        notes: "",
                        speciesId: 1,
                        genderId: 3,
                        ageId: 5,
                        count: 1,
                        diseaseSignIds: [],
                        diseaseSignNotes: "",
                        guid: "8e65f9c5-aeac-40ca-8dd4-20f7204b919f",
                        reportCreated: "2023-02-01T07:42:23.803Z",
                    },
                },
            ],
        },
    ],
};

const injuredReport: Report = {
    id: "15a4de43-8750-4ffb-bbe0-24ea06bcdfb1",
    createdAt: "2023-02-01T07:02:00.254Z",
    status: "success",
    edits: [
        {
            id: 8,
            adds: [
                {
                    geometry: { x: 24.0917209, y: 56.9186659 },
                    attributes: {
                        notes: "",
                        speciesId: 3,
                        genderId: 2,
                        ageId: 3,
                        huntTypeId: 2,
                        permitId: 48920,
                        diseaseSigns: false,
                        usedDate: "2023-02-01T07:02:00.254Z",
                        reportGuid: "e3eac34c-f2fa-4fb5-b047-8f36dbbf4e96",
                        injuredDate: "2023-02-01T07:02:00.254Z",
                        huntingDistrictId: 4,
                        hunterCardNumber: "",
                        isHunterForeigner: false,
                        foreignerPermitNumber: "",
                        guid: "9384f825-4ca8-4cb7-80a0-794d7ca93757",
                        reportCreated: "2023-02-01T07:02:00.254Z",
                    },
                },
            ],
        },
    ],
    result: { strapNumber: "STRAP2_00043", permitId: 48920, reportId: 321 },
};

const huntedReport: Report = {
    id: "85c8d794-33b1-41d8-80c3-0fab3f1bf2be",
    createdAt: "2023-02-01T07:30:00.345Z",
    status: "success",
    edits: [
        {
            id: 8,
            adds: [
                {
                    geometry: { x: 24.0917209, y: 56.9186659 },
                    attributes: {
                        notes: "",
                        speciesId: 3,
                        genderId: 2,
                        ageId: 3,
                        huntTypeId: 1,
                        permitId: 48920,
                        diseaseSigns: false,
                        usedDate: "2023-02-01T07:30:00.345Z",
                        reportGuid: "6e90601c-845e-4f0a-a177-ffeb25e79028",
                        huntingDistrictId: 4,
                        hunterCardNumber: "",
                        isHunterForeigner: false,
                        foreignerPermitNumber: "",
                        guid: "4678311c-c135-4b60-aa7d-bc49f9d3581e",
                        reportCreated: "2023-02-01T07:30:00.345Z",
                    },
                },
            ],
        },
    ],
    result: { strapNumber: "STRAP2_00043", permitId: 48920, reportId: 321 },
};

const injuredReportForOtherPermit: Report = {
    id: "786982c3-73de-42e0-abc4-bc0354bf7444",
    createdAt: "2023-02-01T08:02:31.265Z",
    status: "success",
    edits: [
        {
            id: 8,
            adds: [
                {
                    geometry: { x: -122.0839991, y: 37.4219977 },
                    attributes: {
                        notes: "",
                        speciesId: 2,
                        genderId: 1,
                        ageId: 1,
                        huntTypeId: 2,
                        permitId: 867,
                        diseaseSigns: false,
                        usedDate: "2023-02-01T08:02:31.266Z",
                        reportGuid: "e4928065-285e-40de-8957-50f28d4fb4cb",
                        injuredDate: "2023-02-01T08:02:31.265Z",
                        huntingDistrictId: 4,
                        hunterCardNumber: "",
                        isHunterForeigner: false,
                        foreignerPermitNumber: "",
                        guid: "2fb0250b-2200-4eba-b378-0431774054a7",
                        reportCreated: "2023-02-01T08:02:31.266Z",
                    },
                },
            ],
        },
    ],
    result: { strapNumber: "STRAP_00057", permitId: 867, reportId: 123 },
};

describe("combinePermitsWithReports", () => {
    it("returns unchanged permits when no reports provided", () => {
        const permits = [unusedPermit];
        const result = combinePermitsWithReports(permits, [], permitAllowances);
        expect(result).toEqual(permits);
    });

    it("returns unchanged permits when non limited prey report provided", () => {
        const permits = [unusedPermit];
        const result = combinePermitsWithReports(permits, [observationsReport], permitAllowances);
        expect(result).toEqual(permits);
    });

    it("returns unchanged permits when reports for other permits provided", () => {
        const permits = [unusedPermit];
        const result = combinePermitsWithReports(permits, [injuredReportForOtherPermit], permitAllowances);
        expect(result).toEqual(permits);
    });

    it("returns permits with injured report applied", () => {
        const permits: Permit[] = [unusedPermit];
        const reports: Report[] = [injuredReport];
        const result = combinePermitsWithReports(permits, reports, permitAllowances);
        expect(result).toEqual([
            {
                huntedTypeId: 2,
                huntingDistrictIds: [4],
                issuedHuntingDistrictIds: [4],
                injuredDate: "2023-02-01T07:02:00.254Z",
                isReportEditingEnabled: true,
                permitAllowanceId: 59,
                permitTypeId: 9,
                reportGuid: "e3eac34c-f2fa-4fb5-b047-8f36dbbf4e96",
                strapNumber: "STRAP2_00043",
                strapStatusId: 2,
                validFrom: "2022-04-01T00:00:00",
                validTo: "2023-03-31T00:00:00",
                id: 48920,
            },
        ]);
    });

    it("returns permits with hunted permit applied", () => {
        const result = combinePermitsWithReports([unusedPermit], [huntedReport], permitAllowances);
        expect(result).toEqual([
            {
                huntedTypeId: 1,
                huntingDistrictIds: [4],
                issuedHuntingDistrictIds: [4],
                isReportEditingEnabled: false,
                permitAllowanceId: 59,
                permitTypeId: 9,
                reportGuid: "6e90601c-845e-4f0a-a177-ffeb25e79028",
                strapNumber: "STRAP2_00043",
                strapStatusId: 2,
                validFrom: "2022-04-01T00:00:00",
                validTo: "2023-03-31T00:00:00",
                id: 48920,
            },
        ]);
    });

    it("returns permits with injured and hunted permit applied", () => {
        const result = combinePermitsWithReports([unusedPermit], [injuredReport, huntedReport], permitAllowances);
        expect(result).toEqual([
            {
                huntedTypeId: 1,
                huntingDistrictIds: [4],
                issuedHuntingDistrictIds: [4],
                isReportEditingEnabled: false,
                permitAllowanceId: 59,
                permitTypeId: 9,
                reportGuid: "6e90601c-845e-4f0a-a177-ffeb25e79028",
                strapNumber: "STRAP2_00043",
                strapStatusId: 2,
                validFrom: "2022-04-01T00:00:00",
                validTo: "2023-03-31T00:00:00",
                id: 48920,
            },
        ]);
    });

    it("returns permit with permitAllowanceId if not already available", () => {
        const permits: Permit[] = [{ ...unusedPermit, permitAllowanceId: undefined }];
        const reports: Report[] = [injuredReport];
        const result = combinePermitsWithReports(permits, reports, permitAllowances);
        expect(result).toEqual([
            {
                huntedTypeId: 2,
                huntingDistrictIds: [4],
                issuedHuntingDistrictIds: [4],
                injuredDate: "2023-02-01T07:02:00.254Z",
                isReportEditingEnabled: true,
                permitAllowanceId: 59,
                permitTypeId: 9,
                reportGuid: "e3eac34c-f2fa-4fb5-b047-8f36dbbf4e96",
                strapNumber: "STRAP2_00043",
                strapStatusId: 2,
                validFrom: "2022-04-01T00:00:00",
                validTo: "2023-03-31T00:00:00",
                id: 48920,
            },
        ]);
    });

    it("returns updated permit with hunted report applied", () => {
        const result = combinePermitsWithReports(
            [
                {
                    reportId: 1925,
                    id: 50266,
                    strapNumber: "MC718984",
                    validFrom: "2022-04-01T00:00:00",
                    validTo: "2023-03-31T00:00:00",
                    isReportEditingEnabled: true,
                    huntingDistrictIds: [1],
                    issuedHuntingDistrictIds: [1],
                    permitTypeId: 10,
                    strapStatusId: 2,
                    injuredDate: "2023-03-29T12:45:41.424",
                    huntedTypeId: 2,
                    permitAllowanceId: 66,
                },
            ],
            [
                {
                    id: "b90a06e9-a2c8-4c64-8c37-36381abbc70f",
                    createdAt: "2023-03-30T07:40:01.463Z",
                    status: "pending",
                    edits: [
                        {
                            id: 8,
                            adds: [
                                {
                                    geometry: { x: 21.009610137441683, y: 56.50839714159551 },
                                    attributes: {
                                        notes: "",
                                        speciesId: 4,
                                        genderId: 1,
                                        ageId: 3,
                                        huntTypeId: 1,
                                        permitId: 50266,
                                        diseaseSigns: false,
                                        usedDate: "2023-03-30T07:40:01.463Z",
                                        reportId: 1925,
                                        reportGuid: "8ce1f111-ce61-4cf7-8977-39e53cfc392d",
                                        huntingDistrictId: 1,
                                        hunterCardNumber: "",
                                        isHunterForeigner: false,
                                        foreignerPermitNumber: "",
                                        guid: "b5a15ddf-3099-4205-9105-759bdd9169f7",
                                        reportCreated: "2023-03-30T07:40:01.463Z",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
            permitAllowances
        );
        expect(result[0].strapStatusId).toBe(StrapStatusId.Used);
        expect(result[0].huntedTypeId).toBe(HuntedTypeId.Hunted);
        expect(result[0].huntingDistrictIds).toEqual([1]);
        expect(result[0].isReportEditingEnabled).toBe(false);
        expect(result[0].injuredDate).toBeUndefined();
        expect(result[0].permitAllowanceId).toBe(66);
    });

    it("returns updated permit that's shared among districts", () => {
        const reports: Report[] = [
            {
                id: "7628a414-c072-489f-80dc-48e2de8edd46",
                createdAt: "2023-07-17T10:27:24.072Z",
                status: "success",
                edits: [
                    {
                        id: 8,
                        adds: [
                            {
                                geometry: { x: -122.406417, y: 37.785834 },
                                attributes: {
                                    notes: "",
                                    speciesId: 1,
                                    genderId: 1,
                                    ageId: 3,
                                    huntTypeId: 2,
                                    permitId: 52964,
                                    diseaseSigns: false,
                                    usedDate: "2023-07-17T10:27:24.073Z",
                                    reportId: 2828,
                                    reportGuid: "8d19ee94-3875-4430-a134-d186c9f71ecc",
                                    injuredDate: "2023-07-17T10:27:24.073Z",
                                    huntingDistrictId: 4,
                                    hunterCardNumber: "",
                                    isHunterForeigner: false,
                                    foreignerPermitNumber: "",
                                    guid: "c1251ee4-2ba2-460e-b90a-2e0b911a6872",
                                    reportCreated: "2023-07-17T10:27:24.073Z",
                                },
                            },
                        ],
                    },
                ],
                result: {
                    reportId: 2828,
                    permitId: 52964,
                    strapNumber: "STRAP1_00358",
                },
            },
        ];

        const permits: Permit[] = [
            {
                id: 52964,
                strapNumber: "STRAP1_00358",
                validFrom: "2023-04-01T00:00:00+03:00",
                validTo: "2024-04-01T00:00:00+03:00",
                isReportEditingEnabled: true,
                huntingDistrictIds: [4, 6],
                issuedHuntingDistrictIds: [4, 6],
                permitTypeId: 1,
                strapStatusId: 1,
            },
        ];

        const result = combinePermitsWithReports(permits, reports, permitAllowances);
        expect(result).toEqual([
            {
                huntedTypeId: 2,
                huntingDistrictIds: [4],
                issuedHuntingDistrictIds: [4, 6],
                injuredDate: "2023-07-17T10:27:24.073Z",
                isReportEditingEnabled: true,
                permitAllowanceId: 3,
                permitTypeId: 1,
                reportGuid: "8d19ee94-3875-4430-a134-d186c9f71ecc",
                strapNumber: "STRAP1_00358",
                strapStatusId: 2,
                validFrom: "2023-04-01T00:00:00+03:00",
                validTo: "2024-04-01T00:00:00+03:00",
                id: 52964,
            },
        ]);
    });
});
