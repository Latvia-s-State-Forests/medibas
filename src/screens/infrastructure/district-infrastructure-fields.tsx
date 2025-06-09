import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import { Infrastructure } from "~/types/infrastructure";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";
import { getDistrictDescription } from "~/utils/get-district-description";
import { isEditedInfrastructureNewer } from "~/utils/is-edited-infrastructure-newer";

const DEFAULT_DESCRIPTION = "-";

type DistrictInfrastructureFieldsProps = {
    infrastructure: Infrastructure;
};

export function DistrictInfrastructureFields(props: DistrictInfrastructureFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const profile = useProfile();

    const infrastructureType =
        getDescriptionForClassifierOption(
            classifiers.huntingInfrastructureTypes.options,
            language,
            props.infrastructure.typeId
        ) ?? DEFAULT_DESCRIPTION;

    const districtTitle = getDistrictDescription(profile, props.infrastructure.huntingDistrictId);

    return (
        <View style={styles.container}>
            <ReadOnlyField
                label={t("mtl.infrastructure.coordinates")}
                value={formatPosition({
                    latitude: props.infrastructure.locationY,
                    longitude: props.infrastructure.locationX,
                })}
            />

            <ReadOnlyField
                label={t("mtl.infrastructure.timeAdded")}
                value={formatDateTime(props.infrastructure.createdOnDevice)}
            />

            {isEditedInfrastructureNewer(props.infrastructure.createdOnDevice, props.infrastructure.changedOnDevice) ? (
                <ReadOnlyField
                    label={t("mtl.infrastructure.timeEdited")}
                    value={formatDateTime(props.infrastructure.changedOnDevice)}
                />
            ) : null}

            <ReadOnlyField label={t("mtl.infrastructure.district")} value={districtTitle} />

            <ReadOnlyField label={t("mtl.infrastructure.type")} value={infrastructureType} />

            {props.infrastructure.notes ? (
                <ReadOnlyField label={t("mtl.infrastructure.notes")} value={props.infrastructure.notes} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
