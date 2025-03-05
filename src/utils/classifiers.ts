import { AppLanguage, DEFAULT_APP_LANGUAGE } from "~/i18n";
import { ClassifierOption } from "~/types/classifiers";

export function getDescriptionForClassifierOption(
    options: ClassifierOption[],
    language: AppLanguage,
    id: number
): string | undefined {
    const option = options.find((option) => option.id === id);
    if (!option) {
        return undefined;
    }

    const description = option.description[language] ?? option.description[DEFAULT_APP_LANGUAGE];
    if (!description) {
        return undefined;
    }

    return description;
}

export function getDescriptionForClassifierOptions(
    options: ClassifierOption[],
    language: AppLanguage,
    ids: number[] = []
): string {
    const descriptions: string[] = [];

    for (const [index, id] of ids.entries()) {
        const description = getDescriptionForClassifierOption(options, language, id);
        if (!description) {
            continue;
        }

        if (index === 0) {
            descriptions.push(description);
        } else {
            descriptions.push(description.toLowerCase());
        }
    }

    return descriptions.join(", ");
}
