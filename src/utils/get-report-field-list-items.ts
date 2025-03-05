import { AppLanguage } from "~/i18n";
import { ClassifierOption } from "~/types/classifiers";
import { getDescriptionForClassifierOption } from "./classifiers";

export function getReportFieldListItems(
    reportListItemsIds: number[],
    options: ClassifierOption[],
    language: AppLanguage,
    itemIsOtherId?: number
) {
    let reportListItems = reportListItemsIds;
    if (itemIsOtherId !== undefined) {
        reportListItems = reportListItems.filter((id) => id !== itemIsOtherId);
    }

    return reportListItems
        .map((id, index, reportListItems) => {
            const description = getDescriptionForClassifierOption(options, language, id);
            if (reportListItems.length > 1) {
                return description + (index < reportListItems.length - 1 ? ";" : ".");
            }
            return description;
        })
        .join("\n")
        .trim();
}
