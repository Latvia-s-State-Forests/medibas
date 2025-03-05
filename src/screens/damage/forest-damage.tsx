import * as React from "react";
import { useTranslation } from "react-i18next";
import { CheckboxList } from "~/components/checkbox-button-list";
import { DynamicPicker } from "~/components/dynamic-picker";
import { Input } from "~/components/input";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { SpeciesId, TreeSpeciesId } from "~/types/classifiers";
import { ForestDamageState } from "~/types/damage";
import {
    getActiveClassifiers,
    getDamagedTreeSpecies,
    getOtherDamagedTreeSpecies,
    getResponsibleSpeciesForForestDamage,
} from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";

interface ForestDamageProps {
    damage: ForestDamageState;
    onChange: (update: (damage: ForestDamageState) => ForestDamageState) => void;
}

export function ForestDamage(props: ForestDamageProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const treeSpeciesClassifiers = getDamagedTreeSpecies(classifiers);
    const otherTreeSpeciesClassifiers = getOtherDamagedTreeSpecies(classifiers, getAppLanguage());
    const damageVolumeTypeClassifiers = getActiveClassifiers(classifiers, "damageVolumeTypes");
    const damageVolumeTypeOptions = damageVolumeTypeClassifiers.map((classifier) => ({
        label: formatLabel(classifier.description),
        value: String(classifier.id),
    }));
    const responsibleSpeciesClassifiers = getResponsibleSpeciesForForestDamage(classifiers.animalSpecies.options);
    const responsibleSpeciesOptions = responsibleSpeciesClassifiers.map((classifier) => ({
        label: formatLabel(classifier.description),
        value: String(classifier.id),
    }));
    const damageTypeClassifiers = getActiveClassifiers(classifiers, "forestDamageTypes");

    function onChange(update: Partial<ForestDamageState>) {
        props.onChange((damage) => ({ ...damage, ...update }));
    }

    function onAreaChange(area: string) {
        onChange({ area });
    }

    function onStandProtectionDoneChange(standProtection: string) {
        onChange({ standProtection });
    }

    function onOtherDamagedTreeSpeciesChange(otherDamagedTreeSpecies: string) {
        onChange({ otherDamagedTreeSpecies: Number(otherDamagedTreeSpecies) });
    }

    function onDamageVolumeTypeChange(damageVolumeType: string) {
        onChange({ damageVolumeType: Number(damageVolumeType) });
    }

    function onResponsibleSpeciesChange(responsibleSpecies: string) {
        props.onChange((damage) => ({
            ...damage,
            responsibleSpecies: Number(responsibleSpecies),
        }));
    }

    function onOtherResponsibleSpeciesChange(otherResponsibleSpecies: string) {
        onChange({ otherResponsibleSpecies });
    }

    function onDamagedTreeSpeciesChange(checkedValues: string[]) {
        props.onChange((damage) => {
            const damagedTreeSpecies: { [id: string]: boolean } = {};
            for (const checkedValue of checkedValues) {
                damagedTreeSpecies[checkedValue] = true;
            }
            return {
                ...damage,
                damagedTreeSpecies,
            };
        });
    }

    function onDamageTypeChange(checkedValues: string[]) {
        props.onChange((damage) => {
            const damageTypes: { [id: string]: boolean } = {};
            for (const checkedValue of checkedValues) {
                damageTypes[checkedValue] = true;
            }
            return {
                ...damage,
                damageTypes,
            };
        });
    }

    const checkedDamagedTreeSpecies: string[] = [];
    Object.entries(props.damage.damagedTreeSpecies).forEach(([id, checked]) => {
        if (checked) {
            checkedDamagedTreeSpecies.push(id);
        }
    });

    const checkedTypeSpecies: string[] = [];
    Object.entries(props.damage.damageTypes).forEach(([id, checked]) => {
        if (checked) {
            checkedTypeSpecies.push(id);
        }
    });

    const speciesIsOther = props.damage.responsibleSpecies === SpeciesId.Other;

    return (
        <>
            <Spacer size={24} />
            <Input
                keyboardType="numeric"
                label={t("damage.forest.area")}
                value={props.damage.area}
                onChangeText={onAreaChange}
            />
            <Spacer size={24} />
            <DynamicPicker
                label={t("damage.forest.standProtection.label")}
                options={configuration.damage.forest.standProtection.options.map((option) => ({
                    label: t(option.translationKey),
                    value: option.value,
                }))}
                value={props.damage.standProtection}
                onChange={onStandProtectionDoneChange}
            />
            <Spacer size={24} />
            <CheckboxList
                label={t("damage.forest.damagedTreeSpecies")}
                options={treeSpeciesClassifiers.map((classifier) => ({
                    label: formatLabel(classifier.description),
                    value: String(classifier.id),
                }))}
                onChange={onDamagedTreeSpeciesChange}
                checkedValues={checkedDamagedTreeSpecies}
            />

            {props.damage.damagedTreeSpecies[TreeSpeciesId.Other] && (
                <>
                    <Spacer size={12} />
                    <Select
                        label={t("damage.forest.otherDamagedTreeSpecies")}
                        value={props.damage.otherDamagedTreeSpecies?.toString() ?? ""}
                        onChange={onOtherDamagedTreeSpeciesChange}
                        options={otherTreeSpeciesClassifiers.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                        }))}
                    />
                </>
            )}

            <Spacer size={props.damage.damagedTreeSpecies[TreeSpeciesId.Other] ? 24 : 12} />
            <DynamicPicker
                label={t("damage.forest.damageVolumeType")}
                options={damageVolumeTypeOptions}
                value={props.damage.damageVolumeType?.toString() ?? ""}
                onChange={onDamageVolumeTypeChange}
            />
            <Spacer size={24} />
            <DynamicPicker
                label={t("damage.forest.responsibleSpecies")}
                options={responsibleSpeciesOptions}
                value={props.damage.responsibleSpecies?.toString() ?? ""}
                onChange={onResponsibleSpeciesChange}
            />
            {speciesIsOther ? (
                <>
                    <Spacer size={12} />
                    <Input
                        label={t("damage.forest.otherResponsibleSpecies")}
                        value={props.damage.otherResponsibleSpecies}
                        onChangeText={onOtherResponsibleSpeciesChange}
                    />
                    <Spacer size={24} />
                </>
            ) : (
                <Spacer size={12} />
            )}
            <CheckboxList
                label={t("damage.forest.damageTypes")}
                options={damageTypeClassifiers.map((classifier) => ({
                    label: formatLabel(classifier.description),
                    value: String(classifier.id),
                }))}
                onChange={onDamageTypeChange}
                checkedValues={checkedTypeSpecies}
            />
        </>
    );
}
