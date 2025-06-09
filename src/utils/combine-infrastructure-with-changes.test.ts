import { Infrastructure, InfrastructureChange } from "~/types/infrastructure";
import { combineInfrastructureWithChanges } from "./combine-infrastructure-with-changes";

describe("combineInfrastructureWithChanges", () => {
    it("returns unchanged infrastructure when there are no changes", () => {
        const infrastructure: Infrastructure[] = [
            {
                id: 1,
                guid: "a0365d97-ac63-4b3e-9e26-a5dcdcff93ce",
                huntingDistrictId: 1,
                typeId: 1,
                notes: "Tower 1",
                locationX: 24.0,
                locationY: 56.0,
                changedOnDevice: "2025-05-19T07:00:00.000Z",
                createdOnDevice: "2025-05-19T07:00:00.000Z",
            },
        ];
        const fetched = "2025-05-19T07:05:00.000Z";
        const changes: InfrastructureChange[] = [];
        const result = combineInfrastructureWithChanges(infrastructure, fetched, changes);
        expect(result).toEqual(infrastructure);
    });

    it("returns infrastructure combined with create change", () => {
        const infrastructure: Infrastructure[] = [];
        const fetched = "2025-05-19T07:05:00.000Z";
        const changes: InfrastructureChange[] = [
            {
                id: "570d3d63-5358-40a6-9ac4-199e3a58b404",
                created: "2025-05-19T07:09:00.000Z",
                updated: "2025-05-19T07:10:00.000Z",
                type: "create",
                status: "success",
                infrastructure: {
                    id: 1,
                    guid: "494914b4-0736-4435-b776-8c897617be8e",
                    huntingDistrictId: 1,
                    typeId: 1,
                    notes: "Tower 1",
                    locationX: 24.0,
                    locationY: 56.0,
                    changedOnDevice: "2025-05-19T07:09:00.000Z",
                    createdOnDevice: "2025-05-19T07:09:00.000Z",
                },
            },
        ];
        const result = combineInfrastructureWithChanges(infrastructure, fetched, changes);
        expect(result).toEqual([
            {
                id: 1,
                guid: "494914b4-0736-4435-b776-8c897617be8e",
                huntingDistrictId: 1,
                typeId: 1,
                notes: "Tower 1",
                locationX: 24.0,
                locationY: 56.0,
                changedOnDevice: "2025-05-19T07:09:00.000Z",
                createdOnDevice: "2025-05-19T07:09:00.000Z",
            },
        ]);
    });

    it("returns infrastructure combined with update change", () => {
        const infrastructure: Infrastructure[] = [
            {
                id: 1,
                guid: "494914b4-0736-4435-b776-8c897617be8e",
                huntingDistrictId: 1,
                typeId: 1,
                notes: "Tower 1",
                locationX: 24.0,
                locationY: 56.0,
                changedOnDevice: "2025-05-19T07:00:00.000Z",
                createdOnDevice: "2025-05-19T07:00:00.000Z",
            },
        ];
        const fetched = "2025-05-19T07:05:00.000Z";
        const changes: InfrastructureChange[] = [
            {
                id: "570d3d63-5358-40a6-9ac4-199e3a58b404",
                created: "2025-05-19T07:09:00.000Z",
                updated: "2025-05-19T07:10:00.000Z",
                type: "update",
                status: "success",
                infrastructure: {
                    id: 1,
                    guid: "494914b4-0736-4435-b776-8c897617be8e",
                    huntingDistrictId: 1,
                    typeId: 3,
                    notes: "Bridge 1",
                    locationX: 24.0,
                    locationY: 56.0,
                    changedOnDevice: "2025-05-19T07:09:00.000Z",
                    createdOnDevice: "2025-05-19T07:00:00.000Z",
                },
            },
        ];
        const result = combineInfrastructureWithChanges(infrastructure, fetched, changes);
        expect(result).toEqual([
            {
                id: 1,
                guid: "494914b4-0736-4435-b776-8c897617be8e",
                huntingDistrictId: 1,
                typeId: 3,
                notes: "Bridge 1",
                locationX: 24.0,
                locationY: 56.0,
                changedOnDevice: "2025-05-19T07:09:00.000Z",
                createdOnDevice: "2025-05-19T07:00:00.000Z",
            },
        ]);
    });

    it("returns infrastructure combined with delete change", () => {
        const infrastructure: Infrastructure[] = [
            {
                id: 1,
                guid: "494914b4-0736-4435-b776-8c897617be8e",
                huntingDistrictId: 1,
                typeId: 1,
                notes: "Tower 1",
                locationX: 24.0,
                locationY: 56.0,
                changedOnDevice: "2025-05-19T07:00:00.000Z",
                createdOnDevice: "2025-05-19T07:00:00.000Z",
            },
        ];
        const fetched = "2025-05-19T07:05:00.000Z";
        const changes: InfrastructureChange[] = [
            {
                id: "570d3d63-5358-40a6-9ac4-199e3a58b404",
                created: "2025-05-19T07:09:00.000Z",
                updated: "2025-05-19T07:10:00.000Z",
                type: "delete",
                status: "success",
                infrastructure: {
                    id: 1,
                    guid: "494914b4-0736-4435-b776-8c897617be8e",
                    huntingDistrictId: 1,
                    typeId: 1,
                    notes: "Tower 1",
                    locationX: 24.0,
                    locationY: 56.0,
                    changedOnDevice: "2025-05-19T07:00:00.000Z",
                    createdOnDevice: "2025-05-19T07:00:00.000Z",
                },
            },
        ];
        const result = combineInfrastructureWithChanges(infrastructure, fetched, changes);
        expect(result).toEqual([]);
    });

    it("ignores change that's synced before fetched date", () => {
        const infrastructure: Infrastructure[] = [
            {
                id: 1,
                guid: "494914b4-0736-4435-b776-8c897617be8e",
                huntingDistrictId: 1,
                typeId: 3,
                notes: "Bridge 1",
                locationX: 24.0,
                locationY: 56.0,
                changedOnDevice: "2025-05-19T07:09:00.000Z",
                createdOnDevice: "2025-05-19T07:00:00.000Z",
            },
        ];
        const fetched = "2025-05-19T07:10:00.000Z";
        const changes: InfrastructureChange[] = [
            {
                id: "570d3d63-5358-40a6-9ac4-199e3a58b404",
                created: "2025-05-19T07:00:00.000Z",
                updated: "2025-05-19T07:01:00.000Z",
                type: "create",
                status: "success",
                infrastructure: {
                    id: 1,
                    guid: "494914b4-0736-4435-b776-8c897617be8e",
                    huntingDistrictId: 1,
                    typeId: 1,
                    notes: "Tower 1",
                    locationX: 24.0,
                    locationY: 56.0,
                    changedOnDevice: "2025-05-19T07:00:00.000Z",
                    createdOnDevice: "2025-05-19T07:00:00.000Z",
                },
            },
        ];
        const result = combineInfrastructureWithChanges(infrastructure, fetched, changes);
        expect(result).toEqual(infrastructure);
    });
});
