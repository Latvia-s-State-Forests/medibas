import { HuntPlace } from "~/types/hunts";
import { IndividualHuntFormState } from "./individual-hunt-form";
import { getSubmitIndividualHuntValidationErrors } from "./validation";

const submitDrivenHunt: IndividualHuntFormState & { huntPlace: HuntPlace; hasEquipment: boolean } = {
    district: 1,
    selectedPosition: [56.936432971683445, 27.345833969824536],
    notes: "Some notes",
    equipment: [],
    propertyName: "Some property",
    selectedSpeciesList: [
        {
            speciesId: 9,
        },
    ],
    selectedSpeciesWithEquipmentList: [],
    plannedFromDate: new Date(),
    plannedToDate: new Date(),
    species: "",
    dogs: [],
    hasEquipment: false,
    huntPlace: HuntPlace.InTheStation,
};

describe("getSubmitIndividualHuntValidationErrors", () => {
    it("returns an empty array for valid hunt", () => {
        const errors = getSubmitIndividualHuntValidationErrors(submitDrivenHunt);
        expect(errors).toEqual([]);
    });

    it("if selected district is empty, returns an error", () => {
        const errors = getSubmitIndividualHuntValidationErrors({ ...submitDrivenHunt, district: null });
        expect(errors).toEqual(['"Medību iecirknis" ir obligāti aizpildāms lauks']);
    });

    it("if selected hunt is in WaterBody and propertyName is missing return an error", () => {
        const errors = getSubmitIndividualHuntValidationErrors({
            ...submitDrivenHunt,
            huntPlace: HuntPlace.WaterBody,
            propertyName: "",
        });
        expect(errors).toEqual(['"Ūdenstilpes nosaukums" ir obligāti aizpildāms lauks']);
    });

    it("if starting date is missing return an error", () => {
        const errors = getSubmitIndividualHuntValidationErrors({
            ...submitDrivenHunt,
            plannedFromDate: undefined,
        });
        expect(errors).toEqual(['"Medību sākuma datums" ir obligāti aizpildāms lauks']);
    });

    it("if starting date is selected but end date is not return an error", () => {
        const errors = getSubmitIndividualHuntValidationErrors({
            ...submitDrivenHunt,
            plannedToDate: undefined,
        });
        expect(errors).toEqual(['"Medību beigu datums" ir obligāti aizpildāms lauks']);
    });

    it("if selected position is empty return an error", () => {
        const errors = getSubmitIndividualHuntValidationErrors({
            ...submitDrivenHunt,
            selectedPosition: null,
        });
        expect(errors).toEqual(['"Plānotā medību vieta" ir obligāti aizpildāms lauks']);
    });

    it("if hunt place is not WaterBody and special equipment is not selected and selectedSpeciesList is empty return error", () => {
        const errors = getSubmitIndividualHuntValidationErrors({
            ...submitDrivenHunt,
            selectedSpeciesList: [],
        });
        expect(errors).toEqual(['"Medījamās sugas" ir obligāti aizpildāms lauks']);
    });

    it("if hunt place is not WaterBody and special equipment is selected and selectedSpeciesWithEquipmentList is empty return error", () => {
        const errors = getSubmitIndividualHuntValidationErrors({
            ...submitDrivenHunt,
            selectedSpeciesWithEquipmentList: [],
            hasEquipment: true,
        });
        expect(errors).toEqual(['"Medījamās sugas" ir obligāti aizpildāms lauks']);
    });
});
