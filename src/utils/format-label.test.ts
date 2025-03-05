import i18next from "i18next";
import { ClassifierOptionDescription } from "~/types/classifiers";
import { formatLabel } from "~/utils/format-label";

i18next.init({
    lng: "lv",
    resources: {
        lv: {
            translation: {
                missingLabel: "Trūkst etiķetes",
            },
        },
        en: {
            translation: {
                missingLabel: "Missing label",
            },
        },
        ru: {
            translation: {
                missingLabel: "Отсутствует ярлык",
            },
        },
    },
});

describe("formatLabel should translate in all languages", () => {
    const description: ClassifierOptionDescription = {
        lv: "test-lv",
        en: "test-en",
        ru: "test-ru",
    };

    it("returns lv translation", () => {
        i18next.changeLanguage("lv");
        const result = formatLabel(description);
        expect(result).toBe("test-lv");
    });

    it("returns en translation", () => {
        i18next.changeLanguage("en");

        const result = formatLabel(description);
        expect(result).toBe("test-en");
    });

    it("returns ru translation", () => {
        i18next.changeLanguage("ru");

        const result = formatLabel(description);
        expect(result).toBe("test-ru");
    });
});

describe("formatLabel should fallback to default translation", () => {
    const description: ClassifierOptionDescription = {
        lv: "test-lv",
        en: null,
        ru: null,
    };

    it("returns lv fallback from en translation", () => {
        i18next.changeLanguage("en");

        const result = formatLabel(description);
        expect(result).toBe("test-lv");
    });

    it("returns lv fallback from ru translation", () => {
        i18next.changeLanguage("ru");

        const result = formatLabel(description);
        expect(result).toBe("test-lv");
    });
});

describe("formatLabel fallback to missing label as last resort", () => {
    const description: ClassifierOptionDescription = {
        lv: null,
        en: null,
        ru: null,
    };

    it("returns lv missing label", () => {
        i18next.changeLanguage("lv");
        const result = formatLabel(description);
        expect(result).toBe(i18next.t("missingLabel"));
    });

    it("returns en missing label", () => {
        i18next.changeLanguage("en");

        const result = formatLabel(description);
        expect(result).toBe(i18next.t("missingLabel"));
    });

    it("returns ru missing label", () => {
        i18next.changeLanguage("ru");

        const result = formatLabel(description);
        expect(result).toBe(i18next.t("missingLabel"));
    });
});
