import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import { StatisticsSpeciesItem } from "~/types/statistics";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";

interface SpeciesStatisticsDetailFieldsProps {
    speciesName: string;
    speciesType: "limited" | "unlimited" | "limitedUnlimited";
    statisticsItem: StatisticsSpeciesItem;
}

const DEFAULT_DESCRIPTION = "-";

export function SpeciesStatisticsDetailFields(props: SpeciesStatisticsDetailFieldsProps) {
    const { t } = useTranslation();
    const profile = useProfile();

    const language = getAppLanguage();
    const classifiers = useClassifiers();

    const coordinates = formatPosition({
        latitude: props.statisticsItem.location[1],
        longitude: props.statisticsItem.location[0],
    });

    const huntingDistrict =
        profile.memberships.find((membership) => membership.huntingDistrictId === props.statisticsItem.districtId)
            ?.huntingDistrict.descriptionLv ?? DEFAULT_DESCRIPTION;

    const huntedTime = formatDateTime(props.statisticsItem.huntedTime);

    const strapNumber = props.statisticsItem.strapNumber;

    const gender =
        getDescriptionForClassifierOption(
            classifiers.genders?.options || [],
            language,
            props.statisticsItem.genderId!
        ) ?? DEFAULT_DESCRIPTION;

    const age =
        getDescriptionForClassifierOption(classifiers.ages?.options || [], language, props.statisticsItem.ageId!) ??
        DEFAULT_DESCRIPTION;

    const notes = props.statisticsItem.notes;

    const count = props.statisticsItem.count !== undefined ? String(props.statisticsItem.count) : "";

    const hasSignsOfDisease = props.statisticsItem.hasSignsOfDisease
        ? t("statistics.signsOfDiseaseYes")
        : t("statistics.signsOfDiseaseNo");

    const isLimited = props.speciesType === "limited";
    const isLimitedUnlimited = props.speciesType === "limitedUnlimited";
    const isUnlimited = props.speciesType === "unlimited";

    return (
        <View style={styles.detailContentContainer}>
            <ReadOnlyField label={t("hunt.registeredDate")} value={huntedTime} />
            <ReadOnlyField label={t("hunt.coordinates")} value={coordinates} />

            {strapNumber ? <ReadOnlyField label={t("hunt.strapNumber")} value={strapNumber} /> : null}

            <ReadOnlyField label={t("hunt.species")} value={props.speciesName} />

            {notes ? <ReadOnlyField label={t("hunt.notes")} value={notes} /> : null}

            {isLimited || isLimitedUnlimited ? (
                <>
                    <ReadOnlyField label={t("hunt.district")} value={huntingDistrict} />
                    <ReadOnlyField label={t("hunt.gender")} value={gender} />
                    <ReadOnlyField label={t("hunt.age")} value={age} />
                </>
            ) : null}

            {isUnlimited ? <ReadOnlyField label={t("hunt.count")} value={count} /> : null}
            <ReadOnlyField label={t("hunt.observedSignsOfDisease")} value={hasSignsOfDisease} />
        </View>
    );
}

const styles = StyleSheet.create({
    detailContentContainer: {
        gap: 24,
    },
});
