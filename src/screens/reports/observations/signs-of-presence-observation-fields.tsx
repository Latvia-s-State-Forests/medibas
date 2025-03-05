import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { ObservedSignsId } from "~/types/classifiers";
import { Feature, FeatureLayer, SignsOfPresenceObservationAttributes } from "~/types/report";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { getReportFieldListItems } from "~/utils/get-report-field-list-items";

const DEFAULT_DESCRIPTION = "-";

type SignsOfPresenceObservationFieldsProps = {
    feature: Feature<SignsOfPresenceObservationAttributes>;
};

export function SignsOfPresenceObservationFields(props: SignsOfPresenceObservationFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const attributes = props.feature.attributes;

    const observationType =
        getDescriptionForClassifierOption(
            classifiers.observationTypes.options,
            language,
            FeatureLayer.SignsOfPresenceObservation
        ) ?? DEFAULT_DESCRIPTION;

    const speciesTitle =
        getDescriptionForClassifierOption(classifiers.animalSpecies.options, language, attributes.speciesId) ??
        DEFAULT_DESCRIPTION;

    const signsOfPresence = getReportFieldListItems(
        attributes.observedSignIds,
        classifiers.observedSigns.options,
        language,
        ObservedSignsId.Other
    );

    const otherSignsOfPresence = attributes.observedSignNotes;

    const count = String(attributes.count);

    const huntEventArea = attributes.huntEventArea;

    return (
        <View style={styles.container}>
            <ReadOnlyField label={t("observations.observationType")} value={observationType} />
            <ReadOnlyField label={t("observations.species")} value={speciesTitle} />
            {signsOfPresence ? <ReadOnlyField label={t("observations.observedSigns")} value={signsOfPresence} /> : null}
            {otherSignsOfPresence ? (
                <ReadOnlyField label={t("observations.otherObservedSigns")} value={otherSignsOfPresence} />
            ) : null}
            <ReadOnlyField label={t("observations.count")} value={count} />
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
