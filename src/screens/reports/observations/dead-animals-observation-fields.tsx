import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { ObservedSignsId } from "~/types/classifiers";
import { DeadObservationAttributes, Feature, FeatureLayer } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { getReportFieldListItems } from "~/utils/get-report-field-list-items";

const DEFAULT_DESCRIPTION = "-";

type DeadAnimalsObservationFieldsProps = {
    feature: Feature<DeadObservationAttributes>;
};

export function DeadAnimalsObservationFields(props: DeadAnimalsObservationFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const attributes = props.feature.attributes;

    const observationType =
        getDescriptionForClassifierOption(
            classifiers.observationTypes.options,
            language,
            FeatureLayer.DeadObservation
        ) ?? DEFAULT_DESCRIPTION;

    const speciesTitle =
        getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, attributes.speciesId) ??
        DEFAULT_DESCRIPTION;

    const gender =
        getDescriptionForClassifierOption(classifiers.genders.options, language, attributes.genderId) ??
        DEFAULT_DESCRIPTION;

    const deathType =
        getDescriptionForClassifierOption(classifiers.deathTypes.options, language, attributes.deathTypeId) ??
        DEFAULT_DESCRIPTION;

    const age =
        classifiers.ages.options.find((option) => option.id === attributes.ageId)?.description[language] ??
        DEFAULT_DESCRIPTION;

    const count = String(attributes.count);

    const signsOfDisease = getReportFieldListItems(
        attributes.diseaseSignIds,
        classifiers.diseaseSigns.options,
        language,
        ObservedSignsId.Other
    );

    const otherSignsOfPresence = attributes.diseaseSignNotes;

    const huntEventArea = attributes.huntEventArea;

    return (
        <View style={styles.container}>
            <ReadOnlyField label={t("observations.observationType")} value={observationType} />
            <ReadOnlyField label={t("observations.species")} value={speciesTitle} />
            <ReadOnlyField label={t("observations.gender")} value={gender} />
            <ReadOnlyField label={t("observations.deathType")} value={deathType} />
            <ReadOnlyField label={t("observations.age")} value={age} />
            <ReadOnlyField label={t("observations.count")} value={count} />
            {signsOfDisease ? <ReadOnlyField label={t("observations.signsOfDisease")} value={signsOfDisease} /> : null}
            {otherSignsOfPresence ? (
                <ReadOnlyField label={t("observations.notesOnDiseases")} value={otherSignsOfPresence} />
            ) : null}
            {huntEventArea ? (
                <ReadOnlyField label={t("hunt.drivenHunt.mastArea")} value={String(huntEventArea)} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
