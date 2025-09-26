import { i18n } from "~/i18n";
import { ClassifierOptionDescription } from "~/types/classifiers";

export function formatLabel(description: ClassifierOptionDescription | undefined): string {
    if (!description) {
        return i18n.t("missingLabel");
    } else {
        return description[i18n.language as "lv" | "en" | "ru"] ?? description.lv ?? i18n.t("missingLabel");
    }
}
