import { i18n } from "~/i18n";
import { ClassifierOptionDescription } from "~/types/classifiers";
import { formatLabel } from "~/utils/format-label";

i18n.init({
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
        i18n.changeLanguage("lv");
        const result = formatLabel(description);
        expect(result).toBe("test-lv");
    });

    it("returns en translation", () => {
        i18n.changeLanguage("en");

        const result = formatLabel(description);
        expect(result).toBe("test-en");
    });

    it("returns ru translation", () => {
        i18n.changeLanguage("ru");

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
        i18n.changeLanguage("en");

        const result = formatLabel(description);
        expect(result).toBe("test-lv");
    });

    it("returns lv fallback from ru translation", () => {
        i18n.changeLanguage("ru");

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
        i18n.changeLanguage("lv");
        const result = formatLabel(description);
        expect(result).toBe(i18n.t("missingLabel"));
    });

    it("returns en missing label", () => {
        i18n.changeLanguage("en");

        const result = formatLabel(description);
        expect(result).toBe(i18n.t("missingLabel"));
    });

    it("returns ru missing label", () => {
        i18n.changeLanguage("ru");

        const result = formatLabel(description);
        expect(result).toBe(i18n.t("missingLabel"));
    });
});
