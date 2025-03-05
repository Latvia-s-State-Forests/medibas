import * as React from "react";
import { useTranslation } from "react-i18next";
import { DynamicPicker } from "~/components/dynamic-picker";
import { Input } from "~/components/input";
import { Spacer } from "~/components/spacer";
import { useClassifiers } from "~/hooks/use-classifiers";
import { InfrastructureDamageTypeId, SpeciesId } from "~/types/classifiers";
import { InfrastructureDamageState } from "~/types/damage";
import { getActiveClassifiers, getResponsibleSpeciesForInfrastructureDamage } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";

interface InfrastructureDamageProps {
    damage: InfrastructureDamageState;
    onChange: (update: Partial<InfrastructureDamageState>) => void;
}

export function InfrastructureDamage(props: InfrastructureDamageProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const typeClassifiers = getActiveClassifiers(classifiers, "infrastructureTypes");
    const typeOptions = typeClassifiers.map((classifier) => ({
        label: formatLabel(classifier.description),
        value: String(classifier.id),
    }));
    const responsibleSpeciesClassifiers = getResponsibleSpeciesForInfrastructureDamage(
        classifiers.animalSpecies.options
    );
    const responsibleSpeciesOptions = responsibleSpeciesClassifiers.map((classifier) => ({
        label: formatLabel(classifier.description),
        value: String(classifier.id),
    }));

    function onTypeChange(type: string) {
        props.onChange({ type: Number(type) });
    }

    function onOtherTypeChange(otherType: string) {
        props.onChange({ otherType });
    }

    function onResponsibleSpeciesChange(responsibleSpecies: string) {
        props.onChange({ responsibleSpecies: Number(responsibleSpecies) });
    }

    function onOtherResponsibleSpeciesChange(otherResponsibleSpecies: string) {
        props.onChange({ otherResponsibleSpecies });
    }

    return (
        <>
            <Spacer size={24} />
            <DynamicPicker
                label={t("damage.infrastructure.type")}
                options={typeOptions}
                value={props.damage.type?.toString() ?? ""}
                onChange={onTypeChange}
            />
            {props.damage.type === InfrastructureDamageTypeId.Other && (
                <>
                    <Spacer size={24} />
                    <Input
                        label={t("damage.infrastructure.otherType")}
                        value={props.damage.otherType}
                        onChangeText={onOtherTypeChange}
                    />
                </>
            )}
            <Spacer size={24} />
            <DynamicPicker
                label={t("damage.infrastructure.responsibleSpecies")}
                options={responsibleSpeciesOptions}
                value={props.damage.responsibleSpecies?.toString() ?? ""}
                onChange={onResponsibleSpeciesChange}
            />
            {props.damage.responsibleSpecies === SpeciesId.Other && (
                <>
                    <Spacer size={24} />
                    <Input
                        label={t("damage.infrastructure.otherResponsibleSpecies")}
                        value={props.damage.otherResponsibleSpecies}
                        onChangeText={onOtherResponsibleSpeciesChange}
                    />
                </>
            )}
        </>
    );
}
