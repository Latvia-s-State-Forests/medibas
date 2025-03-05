import * as React from "react";
import { useTranslation } from "react-i18next";
import { TypeField } from "~/components/type-field";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { ObservationTypeId } from "~/types/classifiers";
import { getActiveClassifiers } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";

interface ObservationsTypeProps {
    type?: number;
    onChange: (type: number) => void;
    animalsObservationsItemCount: number;
}

export function ObservationsType(props: ObservationsTypeProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const typeClassifiers = getActiveClassifiers(classifiers, "observationTypes");

    function onChange(rawValue: string) {
        props.onChange(Number(rawValue));
    }

    return (
        <TypeField
            label={t("observations.type")}
            value={props.type?.toString() ?? "no-value"}
            onChange={onChange}
            options={typeClassifiers.map((classifier) => {
                const isDirectlyObservedAnimalsType = props.type === ObservationTypeId.DirectlyObservedAnimals;
                const isTypeSelected = props.type === classifier.id;
                const isMoreThanOneItemAdded = props.animalsObservationsItemCount > 1;
                const isBadgeVisible = isDirectlyObservedAnimalsType && isTypeSelected && isMoreThanOneItemAdded;
                return {
                    label: formatLabel(classifier.description),
                    value: String(classifier.id),
                    iconName: configuration.observations.typeIcons[classifier.id as ObservationTypeId] ?? "cross",
                    badgeCount: isBadgeVisible ? props.animalsObservationsItemCount : undefined,
                };
            })}
        />
    );
}
