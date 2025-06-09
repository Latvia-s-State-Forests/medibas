import { InfrastructureBody } from "~/api";
import { getSubmitInfrastructureValidationErrors } from "./validation";

const submitInfrastructure: InfrastructureBody = {
    districtId: 1,
    location: { x: 24.593464228, y: 56.90021898894159 },
    typeId: 1,
    notes: "Test",
    changedOnDevice: "2025-04-07T07:39:41.863Z",
    createdOnDevice: "2025-04-07T07:39:41.863Z",
};

describe("getSubmitInfrastructureValidationErrors", () => {
    it("returns an empty array for valid infrastructure", () => {
        const errors = getSubmitInfrastructureValidationErrors(
            submitInfrastructure.location,
            submitInfrastructure.typeId,
            submitInfrastructure.districtId
        );
        expect(errors).toEqual([]);
    });

    it("return error if location is missing", () => {
        const errors = getSubmitInfrastructureValidationErrors(
            { x: 0, y: 0 },
            submitInfrastructure.typeId,
            submitInfrastructure.districtId
        );
        expect(errors).toEqual(['"Infrastruktūras vieta" ir obligāti aizpildāms lauks']);
    });

    it("return error if district is missing", () => {
        const errors = getSubmitInfrastructureValidationErrors(
            submitInfrastructure.location,
            submitInfrastructure.typeId,
            0
        );
        expect(errors).toEqual(['"Iecirknis" ir obligāti aizpildāms lauks']);
    });

    it("return error if type is missing", () => {
        const errors = getSubmitInfrastructureValidationErrors(
            submitInfrastructure.location,
            0,
            submitInfrastructure.districtId
        );
        expect(errors).toEqual(['"Veids" ir obligāti aizpildāms lauks']);
    });

    it("returns multiple errors when multiple fields are invalid", () => {
        const errors = getSubmitInfrastructureValidationErrors({ x: 0, y: 0 }, 0, 0);
        expect(errors.length).toBe(3);
    });
});
