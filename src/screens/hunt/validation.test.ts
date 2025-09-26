import {
    getLimitedPreyValidationErrors,
    getLimitedPreyValidationWarnings,
    getUnlimitedPreyValidationErrors,
} from "~/screens/hunt/validation";
import { AgeId, GenderId, HuntedTypeId } from "~/types/classifiers";
import { LimitedPreyState, UnlimitedPreyState } from "~/types/hunt";
import { Permit } from "~/types/permits";

const position = { latitude: 56.918666, longitude: 24.091752, accuracy: 10 };

const validLimitedPreyState: LimitedPreyState = {
    position,
    speciesId: 1,
    type: "1",
    gender: "1",
    age: "1",
    notes: "",
    photo: "...",
    permitId: 1,
    observedSignsOfDisease: false,
    reportGuid: "",
    huntingDistrictId: 0,
    hunterCardNumber: "",
    isHunterForeigner: false,
    foreignerPermitNumber: "",
};

const validUnlimitedPreyState: UnlimitedPreyState = {
    position,
    species: "1",
    subspecies: "",
    count: 1,
    notes: "",
    photo: "...",
    observedSignsOfDisease: false,
    reportGuid: "",
};

const validPermit: Permit = {
    id: 48920,
    strapNumber: "STRAP2_00043",
    validFrom: "2022-04-01T00:00:00",
    validTo: "2023-03-31T00:00:00",
    isReportEditingEnabled: true,
    huntingDistrictIds: [4],
    issuedHuntingDistrictIds: [4],
    permitTypeId: 8,
    strapStatusId: 1,
    permitAllowanceId: 59,
};

const roeDeerMale = 8;
const roeDeerFemaleJuvenile = 9;

describe("getLimitedPreyValidationErrors", () => {
    it("returns an empty array for valid state", () => {
        const errors = getLimitedPreyValidationErrors(validLimitedPreyState);
        expect(errors).toEqual([]);
    });

    it("returns an error for missing position", () => {
        const errors = getLimitedPreyValidationErrors({ ...validLimitedPreyState, position: undefined });
        expect(errors).toEqual(['"Atrašanās vietas koordinātas" ir obligāti aizpildāms lauks']);
    });

    it("returns error for missing foreignerPermitNumber when isHunterForeigner is true", () => {
        const errors = getLimitedPreyValidationErrors({
            ...validLimitedPreyState,
            isHunterForeigner: true,
            foreignerPermitNumber: "",
        });
        expect(errors).toEqual(['"Ievadiet medību atļaujas numuru" ir obligāti aizpildāms lauks']);
    });

    it("returns error for missing type", () => {
        const errors = getLimitedPreyValidationErrors({ ...validLimitedPreyState, type: "" });
        expect(errors).toEqual(['"Tips" ir obligāti aizpildāms lauks']);
    });

    it("returns error for missing gender", () => {
        const errors = getLimitedPreyValidationErrors({ ...validLimitedPreyState, gender: "" });
        expect(errors).toEqual(['"Dzimums" ir obligāti aizpildāms lauks']);
    });

    it("returns error for missing age", () => {
        const errors = getLimitedPreyValidationErrors({ ...validLimitedPreyState, age: "" });
        expect(errors).toEqual(['"Vecums" ir obligāti aizpildāms lauks']);
    });

    it("returns error for missing photo when type is not injured", () => {
        const errors = getLimitedPreyValidationErrors({
            ...validLimitedPreyState,
            type: String(!HuntedTypeId.Injured),
            photo: "",
        });
        expect(errors).toEqual(['"Fotoattēls" ir obligāti aizpildāms lauks']);
    });

    describe("getUnlimitedPreyValidationErrors", () => {
        it("returns an empty array for valid state", () => {
            const errors = getUnlimitedPreyValidationErrors(validUnlimitedPreyState);
            expect(errors).toEqual([]);
        });

        it("returns an error for missing position", () => {
            const errors = getUnlimitedPreyValidationErrors({ ...validUnlimitedPreyState, position: undefined });
            expect(errors).toEqual(['"Atrašanās vietas koordinātas" ir obligāti aizpildāms lauks']);
        });

        it("returns an error for missing subspecies", () => {
            const errors = getUnlimitedPreyValidationErrors(
                { ...validUnlimitedPreyState, subspecies: "" },
                {
                    id: 1,
                    icon: "badger",
                    subspecies: [{ value: "1", label: "Badger" }],
                }
            );
            expect(errors).toEqual(['"Suga" ir obligāti aizpildāms lauks']);
        });

        it("returns an error for missing photo", () => {
            const errors = getUnlimitedPreyValidationErrors({ ...validUnlimitedPreyState, photo: undefined });
            expect(errors).toEqual(['"Fotoattēls" ir obligāti aizpildāms lauks']);
        });
    });

    describe("getLimitedPreyValidationWarnings", () => {
        it("returns a warning for African Swine Fever Zone", () => {
            const warnings = getLimitedPreyValidationWarnings(
                true,
                false,
                validLimitedPreyState,
                undefined,
                validPermit
            );
            expect(warnings).toEqual(["Jūsu iecirknis atrodas ĀCM obligāti izmeklējamā teritorijā"]);
        });

        it("returns a warning for out of district hunting", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                true,
                validLimitedPreyState,
                undefined,
                validPermit
            );
            expect(warnings).toEqual(["Jūsu atrašanās vieta ir ārpus izvēlētā iecirkņa teritorijas"]);
        });

        it("returns a warning for Roe deer(male) when gender is female and age is young", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Female), age: String(AgeId.Young) },
                roeDeerMale,
                validPermit
            );
            expect(warnings).toEqual(["Ievadītie dati par vecumu un dzimumu neatbilst izvēlētam licences veidam"]);
        });

        it("returns a warning for Roe deer(male) when gender is female and age is middle aged", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Female), age: String(AgeId.MiddleAged) },
                roeDeerMale,
                validPermit
            );
            expect(warnings).toEqual(["Ievadītie dati par vecumu un dzimumu neatbilst izvēlētam licences veidam"]);
        });

        it("returns a warning for Roe deer(male) when gender is female and age is old", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Female), age: String(AgeId.Old) },
                roeDeerMale,
                validPermit
            );
            expect(warnings).toEqual(["Ievadītie dati par vecumu un dzimumu neatbilst izvēlētam licences veidam"]);
        });

        it("don't return a warning for Roe deer(male) when gender is female and age is < 1 year", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Female), age: String(AgeId.LessThanOneYear) },
                roeDeerMale,
                validPermit
            );
            expect(warnings).toEqual([]);
        });

        it("don't return a warning for Roe deer(male) when it is registered as injured", () => {
            const roeDeerPermit = { ...validPermit, huntedTypeId: HuntedTypeId.Injured };
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Female), age: String(AgeId.Old) },
                roeDeerMale,
                roeDeerPermit
            );
            expect(warnings).toEqual([]);
        });

        it("returns a warning for Roe deer(female or juvenile) when gender is male and age is young", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Male), age: String(AgeId.Young) },
                roeDeerFemaleJuvenile,
                validPermit
            );
            expect(warnings).toEqual(["Ievadītie dati par vecumu un dzimumu neatbilst izvēlētam licences veidam"]);
        });

        it("returns a warning for Roe deer(female or juvenile) when gender is male and age is middle aged", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Male), age: String(AgeId.MiddleAged) },
                roeDeerFemaleJuvenile,
                validPermit
            );
            expect(warnings).toEqual(["Ievadītie dati par vecumu un dzimumu neatbilst izvēlētam licences veidam"]);
        });

        it("returns a warning for Roe deer(female or juvenile) when gender is male and age is old", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Male), age: String(AgeId.Old) },
                roeDeerFemaleJuvenile,
                validPermit
            );
            expect(warnings).toEqual(["Ievadītie dati par vecumu un dzimumu neatbilst izvēlētam licences veidam"]);
        });

        it("don't return a warning for Roe deer(female or juvenile) when gender is male and age is < 1 year", () => {
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Male), age: String(AgeId.LessThanOneYear) },
                roeDeerFemaleJuvenile,
                validPermit
            );
            expect(warnings).toEqual([]);
        });

        it("don't return a warning for Roe deer(female or juvenile) when it is registered as injured", () => {
            const roeDeerPermit = { ...validPermit, huntedTypeId: HuntedTypeId.Injured };
            const warnings = getLimitedPreyValidationWarnings(
                false,
                false,
                { ...validLimitedPreyState, gender: String(GenderId.Male), age: String(AgeId.Old) },
                roeDeerFemaleJuvenile,
                roeDeerPermit
            );
            expect(warnings).toEqual([]);
        });
    });
});
