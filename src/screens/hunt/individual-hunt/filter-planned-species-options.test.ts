import { HuntPlace } from "~/types/hunts";
import { filterPlannedSpeciesOptions } from "./filter-planned-species-options";

const plannedSpeciesOptions = [
    { label: "Alnis (bullis)", value: { speciesId: 1, permitTypeId: 1 } },
    { label: "Alnis (govs)", value: { speciesId: 1, permitTypeId: 2 } },
    { label: "Alnis (teļš)", value: { speciesId: 1, permitTypeId: 3 } },
    { label: "Alnis (nenoteikts)", value: { speciesId: 1, permitTypeId: 4 } },
    { label: "Staltbriedis (bullis)", value: { speciesId: 2, permitTypeId: 5 } },
    { label: "Staltbriedis (govs)", value: { speciesId: 2, permitTypeId: 6 } },
    { label: "Staltbriedis (teļš)", value: { speciesId: 2, permitTypeId: 7 } },
    { label: "Vilks", value: { speciesId: 6, permitTypeId: 12 } },
    { label: "Mednis", value: { speciesId: 7, permitTypeId: 13 } },
    { label: "Rubenis", value: { speciesId: 8, permitTypeId: 14 } },
    { label: "Stirna (āzis)", value: { speciesId: 3, permitTypeId: 8 } },
    { label: "Stirna (kaza vai kazlēns)", value: { speciesId: 3, permitTypeId: 9 } },
    { label: "Mežacūka", value: { speciesId: 4, permitTypeId: 10 } },
    { label: "Lapsa", value: { speciesId: 9 } },
    { label: "Jenotsuns", value: { speciesId: 10 } },
    { label: "Bebrs", value: { speciesId: 11 } },
    { label: "Āpsis", value: { speciesId: 12 } },
    { label: "Zaķis", value: { speciesId: 13 } },
    { label: "Cauna", value: { speciesId: 16 } },
    { label: "Sesks", value: { speciesId: 19 } },
    { label: "Visi nelimitētie", value: { speciesId: 57 } },
    { label: "Citi zīdītāji", value: { speciesId: 30 } },
    { label: "Putni", value: { speciesId: 31 } },
];

describe("filterPlannedSpeciesOptions", () => {
    it("in district without equipment", () => {
        const result = filterPlannedSpeciesOptions(plannedSpeciesOptions, HuntPlace.InTheStation, false);
        expect(result).toEqual(plannedSpeciesOptions);
    });

    it("in district with equipment", () => {
        const result = filterPlannedSpeciesOptions(plannedSpeciesOptions, HuntPlace.InTheStation, true);
        expect(result).toEqual([
            { label: "Mežacūka", value: { speciesId: 4, permitTypeId: 10 } },
            { label: "Lapsa", value: { speciesId: 9 } },
            { label: "Jenotsuns", value: { speciesId: 10 } },
        ]);
    });

    it("near waters without equipment", () => {
        const result = filterPlannedSpeciesOptions(plannedSpeciesOptions, HuntPlace.WaterBody, false);
        expect(result).toEqual([{ label: "Putni", value: { speciesId: 31 } }]);
    });

    it("near waters with equipment", () => {
        const result = filterPlannedSpeciesOptions(plannedSpeciesOptions, HuntPlace.WaterBody, true);
        expect(result).toEqual([{ label: "Putni", value: { speciesId: 31 } }]);
    });

    it("outside district district without equipment", () => {
        const result = filterPlannedSpeciesOptions(plannedSpeciesOptions, HuntPlace.OutSideStation, false);
        expect(result).toEqual([
            { label: "Lapsa", value: { speciesId: 9 } },
            { label: "Jenotsuns", value: { speciesId: 10 } },
            { label: "Bebrs", value: { speciesId: 11 } },
            { label: "Āpsis", value: { speciesId: 12 } },
            { label: "Zaķis", value: { speciesId: 13 } },
            { label: "Cauna", value: { speciesId: 16 } },
            { label: "Sesks", value: { speciesId: 19 } },
            { label: "Citi zīdītāji", value: { speciesId: 30 } },
            { label: "Putni", value: { speciesId: 31 } },
        ]);
    });

    it("outside district district with equipment", () => {
        const result = filterPlannedSpeciesOptions(plannedSpeciesOptions, HuntPlace.OutSideStation, true);
        expect(result).toEqual([
            { label: "Lapsa", value: { speciesId: 9 } },
            { label: "Jenotsuns", value: { speciesId: 10 } },
        ]);
    });
});
