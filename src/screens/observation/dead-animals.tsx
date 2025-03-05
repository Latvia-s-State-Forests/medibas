import * as React from "react";
import { useTranslation } from "react-i18next";
import { CheckboxList } from "~/components/checkbox-button-list";
import { DynamicPicker } from "~/components/dynamic-picker";
import { Input } from "~/components/input";
import { Spacer } from "~/components/spacer";
import { Stepper } from "~/components/stepper";
import { Switch } from "~/components/switch";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { DeadAnimalsState } from "~/types/observations";
import { getActiveClassifiers } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";

export interface DeadAnimalsProps {
    deadAnimals: DeadAnimalsState;
    onChange: (update: (deadAnimals: DeadAnimalsState) => DeadAnimalsState) => void;
}

export function Dead(props: DeadAnimalsProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const genderClassifiers = getActiveClassifiers(classifiers, "genders");
    const genderOptions = genderClassifiers.map((classifier) => ({
        label: formatLabel(classifier.description),
        value: String(classifier.id),
    }));
    const deathTypeClassifiers = getActiveClassifiers(classifiers, "deathTypes");
    const deathTypeOptions = deathTypeClassifiers.map((classifier) => ({
        label: formatLabel(classifier.description),
        value: String(classifier.id),
    }));
    const ageClassifiers = getActiveClassifiers(classifiers, "ages");
    const ageOptions = ageClassifiers.map((classifier) => ({
        label: formatLabel(classifier.description),
        value: String(classifier.id),
    }));
    const signsOfDiseaseClassifiers = getActiveClassifiers(classifiers, "diseaseSigns");

    function onGenderChange(gender: string) {
        props.onChange((deadAnimals) => {
            return { ...deadAnimals, gender: Number(gender) };
        });
    }

    function onDeathTypeChange(deathType: string) {
        props.onChange((deadAnimals) => {
            return { ...deadAnimals, deathType: Number(deathType) };
        });
    }

    function onAgeChange(age: string) {
        props.onChange((deadAnimals) => {
            return { ...deadAnimals, age: Number(age) };
        });
    }

    function onCountChange(count: number) {
        props.onChange((deadAnimals) => {
            return { ...deadAnimals, count };
        });
    }

    function onObservedSignsOfDiseaseChange() {
        props.onChange((deadAnimals) => {
            return { ...deadAnimals, observedSignsOfDisease: !deadAnimals.observedSignsOfDisease };
        });
    }

    function onDiseaseNotesChanged(notesOnDiseases: string) {
        props.onChange((deadAnimals) => {
            return { ...deadAnimals, notesOnDiseases };
        });
    }

    function onSignsOfDiseaseChecked(checkedValues: string[]) {
        props.onChange((deadAnimals) => {
            const signsOfDisease: { [id: string]: boolean } = {};
            for (const checkedValue of checkedValues) {
                signsOfDisease[checkedValue] = true;
            }
            return {
                ...deadAnimals,
                signsOfDisease,
            };
        });
    }

    const checkedSignsOfDisease: string[] = [];
    Object.entries(props.deadAnimals.signsOfDisease).forEach(([id, checked]) => {
        if (checked) {
            checkedSignsOfDisease.push(id);
        }
    });

    return (
        <>
            <DynamicPicker
                label={t("observations.gender")}
                options={genderOptions}
                value={props.deadAnimals.gender?.toString() ?? ""}
                onChange={onGenderChange}
            />
            <Spacer size={24} />
            <DynamicPicker
                label={t("observations.deathType")}
                options={deathTypeOptions}
                value={props.deadAnimals.deathType?.toString() ?? ""}
                onChange={onDeathTypeChange}
            />
            <Spacer size={24} />
            <DynamicPicker
                label={t("observations.age")}
                options={ageOptions}
                value={props.deadAnimals.age?.toString() ?? ""}
                onChange={onAgeChange}
            />
            <Spacer size={12} />
            <Stepper
                label={t("observations.count")}
                value={props.deadAnimals.count}
                onChange={onCountChange}
                minValue={configuration.observations.deadAnimals.count.min}
                maxValue={configuration.observations.deadAnimals.count.max}
            />
            <Spacer size={12} />
            <Switch
                label={t("observations.observedSignsOfDisease")}
                checked={props.deadAnimals.observedSignsOfDisease}
                onPress={onObservedSignsOfDiseaseChange}
            />
            <Spacer size={12} />
            {props.deadAnimals.observedSignsOfDisease && (
                <>
                    <CheckboxList
                        label={t("observations.observedSigns")}
                        options={signsOfDiseaseClassifiers.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                        }))}
                        onChange={onSignsOfDiseaseChecked}
                        checkedValues={checkedSignsOfDisease}
                    />
                    <Spacer size={12} />
                    <Input
                        label={t("observations.notesOnDiseases")}
                        value={props.deadAnimals.notesOnDiseases}
                        onChangeText={onDiseaseNotesChanged}
                    />
                    <Spacer size={24} />
                </>
            )}
        </>
    );
}
