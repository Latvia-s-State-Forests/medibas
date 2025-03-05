import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { ObservedSignsId } from "~/types/classifiers";
import { DirectlyObservedAnimalsObservationAttributes, Feature, FeatureLayer } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { getReportFieldListItems } from "~/utils/get-report-field-list-items";

const DEFAULT_DESCRIPTION = "-";

type DirectlyObservedAnimalsFieldsProps = {
    features: Array<Feature<DirectlyObservedAnimalsObservationAttributes>>;
};

export function DirectlyObservedAnimalsFields(props: DirectlyObservedAnimalsFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const features = props.features;

    const observationType =
        getDescriptionForClassifierOption(
            classifiers.observationTypes.options,
            language,
            FeatureLayer.DirectlyObservedAnimalsObservation
        ) ?? DEFAULT_DESCRIPTION;

    const speciesTitle =
        getDescriptionForClassifierOption(
            classifiers.animalSpecies.options,
            language,
            features[0].attributes.speciesId
        ) ?? DEFAULT_DESCRIPTION;

    return (
        <>
            <ReadOnlyField label={t("observations.observationType")} value={observationType} />
            <Spacer size={16} />
            <ReadOnlyField label={t("observations.species")} value={speciesTitle} />
            <Spacer size={features.length === 1 ? 16 : 34} />
            <View style={styles.outerContainer}>
                {features.map((feature) => {
                    const attributes = feature.attributes;
                    const gender =
                        getDescriptionForClassifierOption(classifiers.genders.options, language, attributes.genderId) ??
                        DEFAULT_DESCRIPTION;

                    const age =
                        getDescriptionForClassifierOption(classifiers.ages.options, language, attributes.ageId) ??
                        DEFAULT_DESCRIPTION;

                    const count = String(attributes.count);

                    const signsOfDisease = getReportFieldListItems(
                        attributes.diseaseSignIds,
                        classifiers.diseaseSigns.options,
                        language,
                        ObservedSignsId.Other
                    );

                    const notesOnDiseases = attributes.diseaseSignNotes;

                    const huntEventArea = attributes.huntEventArea;

                    return (
                        <View style={styles.innerContainer} key={attributes.guid}>
                            <ReadOnlyField label={t("observations.gender")} value={gender} />
                            <ReadOnlyField label={t("observations.age")} value={age} />
                            <ReadOnlyField label={t("observations.count")} value={count} />
                            {signsOfDisease ? (
                                <ReadOnlyField label={t("observations.signsOfDisease")} value={signsOfDisease} />
                            ) : null}
                            {notesOnDiseases ? (
                                <ReadOnlyField label={t("observations.notesOnDiseases")} value={notesOnDiseases} />
                            ) : null}
                            {huntEventArea ? (
                                <ReadOnlyField label={t("hunt.drivenHunt.mastArea")} value={String(huntEventArea)} />
                            ) : null}
                        </View>
                    );
                })}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        gap: 34,
    },
    innerContainer: {
        gap: 16,
    },
});
