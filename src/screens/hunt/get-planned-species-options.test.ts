import classifiers from "~/__mocks__/classifiers.json";
import { getPlannedSpeciesOptions } from "./get-planned-species-options";

describe("getPlannedSpeciesOptions", () => {
    it("returns planned species options", () => {
        const result = getPlannedSpeciesOptions(classifiers, "lv");
        expect(result).toEqual([
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
        ]);
    });
});
