import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { Feature, UnlimitedHuntReportAttributes } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";

const DEFAULT_DESCRIPTION = "-";

type UnlimitedHuntReportFieldsProps = {
    feature: Feature<UnlimitedHuntReportAttributes>;
};

export function UnlimitedHuntReportFields(props: UnlimitedHuntReportFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const attributes = props.feature.attributes;

    const speciesTitle =
        getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, attributes.speciesId) ??
        DEFAULT_DESCRIPTION;

    const count = String(attributes.count);

    const hasSignsOfDisease = attributes.diseaseSigns
        ? t("damage.forest.standProtection.yes")
        : t("damage.forest.standProtection.no");

    return (
        <View style={styles.container}>
            <ReadOnlyField label={t("hunt.species")} value={speciesTitle} />
            <ReadOnlyField label={t("hunt.count")} value={count} />
            <ReadOnlyField label={t("hunt.observedSignsOfDisease")} value={hasSignsOfDisease} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
