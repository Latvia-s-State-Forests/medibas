import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useReport } from "~/components/reports-provider";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import { Feature, LimitedHuntReportAttributes } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";

const DEFAULT_DESCRIPTION = "-";

type LimitedHuntReportFieldsProps = {
    feature: Feature<LimitedHuntReportAttributes>;
    reportId: string;
};
export function LimitedHuntReportFields(props: LimitedHuntReportFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const profile = useProfile();
    const attributes = props.feature.attributes;
    const report = useReport(props.reportId);

    let strapNumber: string | undefined = undefined;
    if (report?.status === "success") {
        strapNumber = report.result?.strapNumber;
    }

    const huntingDistrict =
        profile.memberships.find((membership) => membership.huntingDistrictId === attributes.huntingDistrictId)
            ?.huntingDistrict.descriptionLv ?? DEFAULT_DESCRIPTION;

    const changedHunterCardNumber = attributes.hunterCardNumber;

    const foreignerPermitNumber = attributes.foreignerPermitNumber;

    const speciesTitle =
        getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, attributes.speciesId) ??
        DEFAULT_DESCRIPTION;

    const huntedType =
        getDescriptionForClassifierOption(classifiers.huntedTypes.options, language, attributes.huntTypeId) ??
        DEFAULT_DESCRIPTION;

    const gender =
        getDescriptionForClassifierOption(classifiers.genders.options, language, attributes.genderId) ??
        DEFAULT_DESCRIPTION;

    const age =
        getDescriptionForClassifierOption(classifiers.ages.options, language, attributes.ageId) ?? DEFAULT_DESCRIPTION;

    const hasSignsOfDisease = attributes.diseaseSigns
        ? t("damage.forest.standProtection.yes")
        : t("damage.forest.standProtection.no");

    return (
        <View style={styles.container}>
            {strapNumber ? <ReadOnlyField label={t("reports.strapNumber")} value={strapNumber} /> : null}
            <ReadOnlyField label={t("hunt.district")} value={huntingDistrict} />
            {changedHunterCardNumber ? (
                <ReadOnlyField label={t("hunt.changedHunterCardNumber")} value={changedHunterCardNumber} />
            ) : null}
            {foreignerPermitNumber ? (
                <ReadOnlyField label={t("hunt.foreignerHunterCardNumber")} value={foreignerPermitNumber} />
            ) : null}
            <ReadOnlyField label={t("hunt.species")} value={speciesTitle} />
            <ReadOnlyField label={t("hunt.type")} value={huntedType} />
            <ReadOnlyField label={t("hunt.gender")} value={gender} />
            <ReadOnlyField label={t("hunt.age")} value={age} />
            <ReadOnlyField label={t("hunt.observedSignsOfDisease")} value={hasSignsOfDisease} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
