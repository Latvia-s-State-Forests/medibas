import i18next from "i18next";
import { ClassifierOptionDescription } from "~/types/classifiers";

export function formatLabel(description: ClassifierOptionDescription | undefined): string {
    if (!description) {
        return i18next.t("missingLabel");
    } else {
        return description[i18next.language as "lv" | "en" | "ru"] ?? description.lv ?? i18next.t("missingLabel");
    }
}
