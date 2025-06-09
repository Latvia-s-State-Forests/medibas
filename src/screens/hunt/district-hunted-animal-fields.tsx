import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ReadOnlyField } from "~/components/read-only-field";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import { HuntedAnimal } from "~/types/hunted-animals";
import { getDescriptionForClassifierOption } from "~/utils/classifiers";
import { formatDateTime } from "~/utils/format-date-time";
import { formatPosition } from "~/utils/format-position";

const DEFAULT_DESCRIPTION = "-";

type DistrictHuntedAnimalFieldsProps = {
    huntedAnimal: HuntedAnimal;
};

export function DistrictHuntedAnimalFields(props: DistrictHuntedAnimalFieldsProps) {
    const { t } = useTranslation();
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const profile = useProfile();

    const district = profile.memberships.find(
        (membership) => membership.huntingDistrictId === props.huntedAnimal.districtId
    )?.huntingDistrict.descriptionLv;

    const permitType =
        getDescriptionForClassifierOption(classifiers.permitTypes.options, language, props.huntedAnimal.permitTypeId) ??
        DEFAULT_DESCRIPTION;

    return (
        <View style={styles.container}>
            <ReadOnlyField
                label={t("reports.coordinates")}
                value={formatPosition({
                    latitude: props.huntedAnimal.location[1],
                    longitude: props.huntedAnimal.location[0],
                })}
            />

            <ReadOnlyField label={t("reports.registeredDate")} value={formatDateTime(props.huntedAnimal.huntedTime)} />

            <ReadOnlyField label={t("reports.strapNumber")} value={props.huntedAnimal.strapNumber} />

            <ReadOnlyField label={t("hunt.district")} value={district ?? ""} />

            <ReadOnlyField label={t("hunt.species")} value={permitType} />

            {props.huntedAnimal.notes ? (
                <ReadOnlyField label={t("hunt.notes")} value={props.huntedAnimal.notes} />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});
