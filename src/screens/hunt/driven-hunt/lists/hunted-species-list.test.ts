import { HuntedTypeId } from "~/types/classifiers";
import { getFilteredHuntedSpecies } from "~/utils/get-filtered-hunted-species";
import { getSortedItems } from "~/utils/get-sorted-items";

const speciesMap = new Map<number, string>([
    [7, "Mednis"],
    [8, "Rubenis"],
    [10, "Jenotsuns"],
    [11, "Bebrs"],
    [12, "Āpsis"],
    [14, "Pelēkais zaķis"],
    [15, "Baltais zaķis"],
    [16, "Cauna"],
    [17, "Meža cauna"],
    [18, "Akmens cauna"],
    [19, "Sesks"],
    [20, "Amerikas ūdele"],
    [21, "Jenots"],
    [22, "Ondatra"],
    [23, "Dambriedis"],
    [24, "Muflons"],
    [25, "Sika briedis"],
    [26, "Nutrija"],
    [27, "Baibaks"],
    [28, "Zeltainais šakālis"],
    [29, "Lācis"],
    [32, "Mežirbe"],
    [33, "Raķelis"],
    [34, "Fazāns"],
    [35, "Lauku balodis"],
    [36, "Mājas balodis"],
    [37, "Sloka"],
    [38, "Pelēkā vārna"],
    [39, "Žagata"],
    [40, "Sējas zoss"],
    [41, "Baltpieres zoss"],
    [42, "Kanādas zoss"],
    [43, "Meža zoss"],
    [44, "Laucis"],
    [45, "Krīklis"],
    [46, "Pelēkā pīle"],
    [47, "Platknābis"],
    [48, "Meža pīle"],
    [49, "Prīkšķe"],
    [50, "Baltvēderis"],
    [51, "Garkaklis"],
    [52, "Cekulpīle"],
    [53, "Ķerra"],
    [54, "Melnā pīle"],
    [55, "Gaigala"],
    [56, "Cita"],
    [57, "Visi nelimitētie"],
    [100, "Mizgrauzis"],
    [13, "Zaķis"],
    [30, "Citi zīdītāji"],
    [31, "Putni"],
    [6, "Vilks"],
    [1, "Alnis"],
    [9, "Lapsa"],
    [2, "Staltbriedis"],
    [3, "Stirna"],
    [4, "Mežacūka"],
    [5, "Lūsis"],
]);

describe("getFilteredHuntedSpecies", () => {
    const huntedAnimals = [
        {
            speciesId: 4, // "Mežacūka"
            strapNumber: "MC24-00016",
            huntedTypeId: HuntedTypeId.Hunted,
            reportCreatedOn: "2025-01-20T23:51:53.932+02:00",
        },
        {
            speciesId: 3, // "Stirna"
            strapNumber: "SA24-00015",
            huntedTypeId: HuntedTypeId.Hunted,
            reportCreatedOn: "2025-01-20T23:51:53.932+02:00",
        },
        {
            speciesId: 3, // "Stirna"
            strapNumber: "SA24-00017",
            huntedTypeId: HuntedTypeId.Injured,
            reportCreatedOn: "2025-01-20T23:51:53.932+02:00",
        },
        {
            speciesId: 9, // "Lapsa"
            reportCreatedOn: "2025-01-29T13:43:30.049+02:00",
        },
    ];

    it("filters hunted species", () => {
        const hunted = getFilteredHuntedSpecies(huntedAnimals, speciesMap, HuntedTypeId.Hunted);
        expect(hunted).toEqual(["Mežacūka (MC24-00016)", "Stirna (SA24-00015)"]);
    });

    it("filters non-limited species", () => {
        const nonLimited = getFilteredHuntedSpecies(huntedAnimals, speciesMap, null);
        expect(nonLimited).toEqual(["Lapsa"]);
    });

    it("filters injured species", () => {
        const injured = getFilteredHuntedSpecies(huntedAnimals, speciesMap, HuntedTypeId.Injured);
        expect(injured).toEqual(["Stirna (SA24-00017)"]);
    });

    it("combines and sorts species", () => {
        const hunted = getFilteredHuntedSpecies(huntedAnimals, speciesMap, HuntedTypeId.Hunted);
        const nonLimited = getFilteredHuntedSpecies(huntedAnimals, speciesMap, null);
        const combined = getSortedItems([...hunted, ...nonLimited]);
        expect(combined).toEqual(["Lapsa", "Mežacūka (MC24-00016)", "Stirna (SA24-00015)"]);
    });
});
