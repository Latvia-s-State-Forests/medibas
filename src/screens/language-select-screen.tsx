import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { appStorage } from "~/app-storage";
import { Button } from "~/components/button";
import { ScreenBackgroundLayout } from "~/components/screen-background-layout";
import { SegmentedControl } from "~/components/segmented-control";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { AppLanguage, getAppLanguage, setAppLanguage } from "~/i18n";
import { theme } from "~/theme";

type LanguageSelectScreenProps = {
    onLanguageSelected: () => void;
};

export function LanguageSelectScreen(props: LanguageSelectScreenProps) {
    const { t } = useTranslation();

    const language = getAppLanguage();

    function onLanguageChange(language: string) {
        setAppLanguage(language as AppLanguage);
    }

    function onButtonPress() {
        appStorage.setLanguage(language);
        props.onLanguageSelected();
    }

    return (
        <ScreenBackgroundLayout>
            <View style={styles.container}>
                <Text style={styles.text} weight="bold">
                    {t("languageSelect.title")}
                </Text>
                <Spacer size={24} />
                <SegmentedControl
                    value={language}
                    onChange={onLanguageChange}
                    options={[
                        {
                            label: t("settings.language.lv"),
                            value: "lv",
                        },
                        {
                            label: t("settings.language.en"),
                            value: "en",
                        },
                        {
                            label: t("settings.language.ru"),
                            value: "ru",
                        },
                    ]}
                />
                <Spacer size={24} />
                <Button onPress={onButtonPress} title={t("languageSelect.next")} />
            </View>
        </ScreenBackgroundLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingTop: 34,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: theme.color.white,
        borderRadius: 8,
    },
    text: {
        textAlign: "center",
    },
});
