import { DEFAULT_APP_LANGUAGE, getAppLanguage } from "~/i18n";
import { Classifiers } from "~/types/classifiers";

export function getErrorMessageFromApi(errorCode: number | undefined, classifiers: Classifiers): string | undefined {
    if (!errorCode) {
        return undefined;
    }

    const errorClassifier = classifiers.errorMessages.options.find((classifier) => classifier.id === errorCode);
    const appLanguage = getAppLanguage() ?? DEFAULT_APP_LANGUAGE;

    const description = errorClassifier?.description[appLanguage] ?? errorClassifier?.description[DEFAULT_APP_LANGUAGE];
    return description ?? undefined;
}
