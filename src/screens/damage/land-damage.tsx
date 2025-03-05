import * as React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "~/components/input";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { Stepper } from "~/components/stepper";
import { TypeField } from "~/components/type-field";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { AgriculturalLandTypeId, MainAgriculturalLandType, SpeciesId } from "~/types/classifiers";
import { LandDamageState } from "~/types/damage";
import {
    getAgriculturalLandSpecies,
    getAgriculturalLandSubtypes,
    getAgriculturalLandTypes,
} from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";
import { isLandDamageAreaVisible } from "./is-land-damage-area-visible";
import { isLandDamageCountVisible } from "./is-land-damage-count-visible";

interface LandDamageProps {
    damage: LandDamageState;
    onChange: (update: (landDamage: LandDamageState) => LandDamageState) => void;
}

export function LandDamage(props: LandDamageProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const typeClassifiers = getAgriculturalLandTypes(classifiers);
    const subtypeClassifiers = getAgriculturalLandSubtypes(classifiers);
    const speciesClassifiers = getAgriculturalLandSpecies(classifiers.animalSpecies.options, props.damage.type);
    const subspeciesClassifiers = getAgriculturalLandSpecies(classifiers.animalSpecies.options, props.damage.subtype);

    function onChange(update: Partial<LandDamageState>) {
        props.onChange((damage) => ({ ...damage, ...update }));
    }

    function onTypeChange(type: string) {
        if (props.damage.type === Number(type)) {
            return;
        }
        onChange({ type: Number(type), species: undefined });
    }

    function onSubtypeChange(subtype: string) {
        onChange({ subtype: Number(subtype), species: undefined });
    }

    function onSpeciesChange(species: string) {
        onChange({ species: Number(species) });
    }

    function onCustomSpeciesChange(customSpecies: string) {
        onChange({ customSpecies });
    }

    function onOtherSpeciesChange(otherSpecies: string) {
        onChange({ otherSpecies });
    }

    function onAreaChange(area: string) {
        onChange({ area });
    }

    function onCountChange(count: number) {
        onChange({ count });
    }

    const isSubtypeVisible = props.damage.type === AgriculturalLandTypeId.Other;
    const isSpeciesVisible = props.damage.type && props.damage.type !== AgriculturalLandTypeId.Other;
    const isSubspeciesVisible =
        isSubtypeVisible && props.damage.subtype && props.damage.subtype !== AgriculturalLandTypeId.Other;
    const isCustomSpeciesVisible = isSubtypeVisible && props.damage.subtype === AgriculturalLandTypeId.Other;
    const isOtherSpeciesVisible = props.damage.species === SpeciesId.Other;

    const isAreaVisible = isLandDamageAreaVisible(
        props.damage.type ?? 0,
        props.damage.subtype ?? 0,
        classifiers.agriculturalTypes.options
    );
    const isCountVisible = isLandDamageCountVisible(
        props.damage.type ?? 0,
        props.damage.subtype ?? 0,
        classifiers.agriculturalTypes.options
    );

    return (
        <>
            <Spacer size={24} />
            <TypeField
                label={t("damage.land.type")}
                options={typeClassifiers.map((classifier) => ({
                    label: formatLabel(classifier.description),
                    value: String(classifier.id),
                    iconName: configuration.damage.land.typeIcons[classifier.id as MainAgriculturalLandType] ?? "cross",
                }))}
                value={props.damage.type?.toString() ?? ""}
                onChange={onTypeChange}
            />
            {isSubtypeVisible && (
                <>
                    <Spacer size={24} />
                    <Select
                        label={t("damage.land.subtype")}
                        value={props.damage.subtype?.toString() ?? ""}
                        onChange={onSubtypeChange}
                        options={subtypeClassifiers.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                        }))}
                    />
                </>
            )}
            {isSpeciesVisible && (
                <>
                    <Spacer size={24} />
                    <Select
                        label={t("damage.land.species")}
                        value={props.damage.species?.toString() ?? ""}
                        onChange={onSpeciesChange}
                        options={speciesClassifiers.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                        }))}
                    />
                </>
            )}

            {isSubspeciesVisible && (
                <>
                    <Spacer size={24} />
                    <Select
                        label={t("damage.land.species")}
                        value={props.damage.species?.toString() ?? ""}
                        onChange={onSpeciesChange}
                        options={subspeciesClassifiers.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                        }))}
                    />
                </>
            )}

            {isCustomSpeciesVisible && (
                <>
                    <Spacer size={24} />
                    <Input
                        label={t("damage.land.species")}
                        value={props.damage.customSpecies}
                        onChangeText={onCustomSpeciesChange}
                    />
                </>
            )}
            {isOtherSpeciesVisible && (
                <>
                    <Spacer size={24} />
                    <Input
                        label={t("damage.land.otherSpecies")}
                        value={props.damage.otherSpecies}
                        onChangeText={onOtherSpeciesChange}
                    />
                </>
            )}
            {isAreaVisible && (
                <>
                    <Spacer size={24} />
                    <Input
                        keyboardType="numeric"
                        label={t("damage.land.area")}
                        value={props.damage.area}
                        onChangeText={onAreaChange}
                    />
                </>
            )}
            {isCountVisible && (
                <>
                    <Spacer size={24} />
                    <Stepper
                        label={t("damage.land.count")}
                        value={props.damage.count}
                        onChange={onCountChange}
                        minValue={configuration.damage.land.count.min}
                        maxValue={configuration.damage.land.count.max}
                    />
                </>
            )}
        </>
    );
}
