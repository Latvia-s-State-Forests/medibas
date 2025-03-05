import * as React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { SpeciesField } from "~/components/species-field";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { getAppLanguage } from "~/i18n";
import { MainObservationSpecies, SpeciesId } from "~/types/classifiers";
import { getObservationBirds, getObservationOtherMammals, getObservationSpecies } from "~/utils/filter-classifiers";
import { formatLabel } from "~/utils/format-label";

interface ObservationsSpeciesProps {
    species?: number;
    onSpeciesChange: (species: number) => void;
    otherMammals?: number;
    onOtherMammalsChange: (otherMammals: number) => void;
    birds?: number;
    onBirdsChange: (birds: number) => void;
}

export function ObservationsSpecies(props: ObservationsSpeciesProps) {
    const { t } = useTranslation();
    const classifiers = useClassifiers();
    const speciesClassifiers = getObservationSpecies(classifiers);
    const language = getAppLanguage();
    const otherMammalsClassifiers = getObservationOtherMammals(classifiers, language);
    const birdsClassifiers = getObservationBirds(classifiers, language);

    function onSpeciesChange(species: string) {
        props.onSpeciesChange(Number(species));
    }

    function onOtherMammalsChange(otherMammals: string) {
        props.onOtherMammalsChange(Number(otherMammals));
    }

    function onBirdsChange(birds: string) {
        props.onBirdsChange(Number(birds));
    }

    return (
        <>
            <Spacer size={24} />
            <SpeciesField
                label={t("observations.speciesMainGroup")}
                options={speciesClassifiers.map((classifier) => ({
                    label: formatLabel(classifier.description),
                    value: String(classifier.id),
                    iconName:
                        configuration.observations.speciesIcons[classifier.id as MainObservationSpecies] ?? "cross",
                }))}
                value={props.species?.toString() ?? ""}
                onChange={onSpeciesChange}
            />
            <Spacer size={8} />

            {props.species === SpeciesId.OtherMammals && (
                <>
                    <Select
                        label={t("observations.otherMammals")}
                        value={props.otherMammals?.toString() ?? ""}
                        onChange={onOtherMammalsChange}
                        options={otherMammalsClassifiers.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                        }))}
                    />
                    <Spacer size={24} />
                </>
            )}

            {props.species === SpeciesId.Birds && (
                <>
                    <Select
                        label={t("observations.birds")}
                        value={props.birds?.toString() ?? ""}
                        onChange={onBirdsChange}
                        options={birdsClassifiers.map((classifier) => ({
                            label: formatLabel(classifier.description),
                            value: String(classifier.id),
                        }))}
                    />
                    <Spacer size={24} />
                </>
            )}
        </>
    );
}
