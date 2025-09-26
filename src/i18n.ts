/* eslint-disable import/no-named-as-default-member */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "~/locales/en.json";
import lv from "~/locales/lv.json";
import ru from "~/locales/ru.json";

export const DEFAULT_APP_LANGUAGE: AppLanguage = "lv";

export function initI18n(language: AppLanguage = DEFAULT_APP_LANGUAGE) {
    i18n.use(initReactI18next).init({
        lng: language,
        fallbackLng: "lv",
        resources: {
            en: { translation: en },
            lv: { translation: lv },
            ru: { translation: ru },
        },
    });
}

export type AppLanguage = "lv" | "en" | "ru";

export function getAppLanguage(): AppLanguage {
    return i18n.language as AppLanguage;
}

export function setAppLanguage(language: AppLanguage) {
    i18n.changeLanguage(language);
}

export { i18n };
