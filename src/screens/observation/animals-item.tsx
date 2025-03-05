import * as Crypto from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, View } from "react-native";
import { CheckboxList } from "~/components/checkbox-button-list";
import { DynamicPicker } from "~/components/dynamic-picker";
import { Input } from "~/components/input";
import { Spacer } from "~/components/spacer";
import { Stepper } from "~/components/stepper";
import { Switch } from "~/components/switch";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { Classifiers } from "~/types/classifiers";
import { AnimalsItemState } from "~/types/observations";
import { getActiveClassifiers } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";

export function getDefaultAnimalsItemState(classifiers: Classifiers): AnimalsItemState {
    return {
        id: Crypto.randomUUID(),
        gender: classifiers.genders.defaultValue ?? configuration.observations.animals.defaultGender,
        age: classifiers.ages.defaultValue ?? configuration.observations.animals.defaultAge,
        isCollapsed: false,
        count: configuration.observations.animals.count.defaultValue ?? 1,
        observedSignsOfDisease: false,
        signsOfDisease: {},
        notesOnDiseases: "",
    };
}

interface AnimalsItemProps {
    item: AnimalsItemState;
    onChange: (update: Partial<AnimalsItemState> | ((prevState: AnimalsItemState) => AnimalsItemState)) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
}

export function AnimalsItem(props: AnimalsItemProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const genderClassifiers = getActiveClassifiers(classifiers, "genders");
    const genderOptions = genderClassifiers.map((classifier) => ({
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
        props.onChange({ gender: Number(gender) });
    }

    function onAgeChange(age: string) {
        props.onChange({ age: Number(age) });
    }

    function onCountChange(count: number) {
        props.onChange({ count });
    }

    function onObservedSignsOfDiseaseChange() {
        props.onChange((deadAnimals) => {
            return { ...deadAnimals, observedSignsOfDisease: !deadAnimals.observedSignsOfDisease };
        });
    }

    function onDiseaseNotesChanged(notesOnDiseases: string) {
        props.onChange({ notesOnDiseases });
    }

    function onSignsOfDiseaseChecked(checkedValues: string[]) {
        props.onChange((item) => {
            const signsOfDisease: { [id: string]: boolean } = {};
            for (const checkedValue of checkedValues) {
                signsOfDisease[checkedValue] = true;
            }
            return {
                ...item,
                signsOfDisease,
            };
        });
    }

    const checkedSignsOfDisease: string[] = [];
    Object.entries(props.item.signsOfDisease).forEach(([id, checked]) => {
        if (checked) {
            checkedSignsOfDisease.push(id);
        }
    });

    return (
        <View onLayout={props.onLayout}>
            <DynamicPicker
                label={t("observations.gender")}
                options={genderOptions}
                value={props.item.gender?.toString() ?? ""}
                onChange={onGenderChange}
            />
            <Spacer size={24} />
            <DynamicPicker
                label={t("observations.age")}
                options={ageOptions}
                value={props.item.age?.toString() ?? ""}
                onChange={onAgeChange}
            />
            <Spacer size={12} />
            <Stepper
                label={t("observations.count")}
                value={props.item.count}
                onChange={onCountChange}
                minValue={configuration.observations.animals.count.min}
                maxValue={configuration.observations.animals.count.max}
            />
            <Spacer size={12} />
            <Switch
                label={t("observations.observedSignsOfDisease")}
                checked={props.item.observedSignsOfDisease}
                onPress={onObservedSignsOfDiseaseChange}
            />
            {props.item.observedSignsOfDisease && (
                <>
                    <Spacer size={12} />
                    <CheckboxList
                        label={t("observations.signsOfDisease")}
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
                        value={props.item.notesOnDiseases}
                        onChangeText={onDiseaseNotesChanged}
                    />
                </>
            )}
        </View>
    );
}
