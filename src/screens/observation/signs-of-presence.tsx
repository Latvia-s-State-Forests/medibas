import * as React from "react";
import { useTranslation } from "react-i18next";
import { CheckboxList } from "~/components/checkbox-button-list";
import { Input } from "~/components/input";
import { Spacer } from "~/components/spacer";
import { Stepper } from "~/components/stepper";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { ObservedSignsId } from "~/types/classifiers";
import { SignsOfPresenceState } from "~/types/observations";
import { getActiveClassifiers } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";

interface SignsOfPresenceProps {
    signsOfPresence: SignsOfPresenceState;
    onChange: (update: (signsOfPresence: SignsOfPresenceState) => SignsOfPresenceState) => void;
}

export function SignsOfPresence(props: SignsOfPresenceProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const observedSignsClassifiers = getActiveClassifiers(classifiers, "observedSigns");

    function onObservedSignsNotesChange(observedSignsNotes: string) {
        props.onChange((signsOfPresence) => {
            return { ...signsOfPresence, observedSignsNotes };
        });
    }

    function onCountChange(count: number) {
        props.onChange((signsOfPresence) => {
            return { ...signsOfPresence, count };
        });
    }

    function onObservedSignClick(checkedValues: string[]) {
        props.onChange((signsOfPresence) => {
            const observedSigns: { [id: string]: boolean } = {};
            for (const checkedValue of checkedValues) {
                observedSigns[checkedValue] = true;
            }
            return {
                ...signsOfPresence,
                observedSigns,
            };
        });
    }

    const checkedObservations: string[] = [];
    Object.entries(props.signsOfPresence.observedSigns).forEach(([id, checked]) => {
        if (checked) {
            checkedObservations.push(id);
        }
    });

    return (
        <>
            <CheckboxList
                label={t("observations.observedSigns")}
                options={observedSignsClassifiers.map((classifier) => ({
                    label: formatLabel(classifier.description),
                    value: String(classifier.id),
                }))}
                onChange={onObservedSignClick}
                checkedValues={checkedObservations}
            />
            {props.signsOfPresence.observedSigns[ObservedSignsId.Other] && (
                <>
                    <Spacer size={12} />
                    <Input
                        label={t("observations.observedSignsNotes")}
                        value={props.signsOfPresence.observedSignsNotes}
                        onChangeText={onObservedSignsNotesChange}
                    />
                </>
            )}
            <Spacer size={props.signsOfPresence.observedSigns[ObservedSignsId.Other] ? 24 : 12} />
            <Stepper
                label={t("observations.count")}
                value={props.signsOfPresence.count}
                onChange={onCountChange}
                minValue={configuration.observations.signsOfPresence.count.min}
                maxValue={configuration.observations.signsOfPresence.count.max}
            />
            <Spacer size={24} />
        </>
    );
}
