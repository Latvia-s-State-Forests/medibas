import { useInterpret } from "@xstate/react";
import { addDays, endOfDay } from "date-fns";
import * as Crypto from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { HuntDog, HuntSpecies } from "~/api";
import { Button } from "~/components/button";
import { CheckboxList } from "~/components/checkbox-button-list";
import { DateInput } from "~/components/date-input";
import { ErrorMessage } from "~/components/error-message";
import { FieldLabel } from "~/components/field-label";
import { Input } from "~/components/input";
import { PositionSelect } from "~/components/map/position-select";
import { MultiSelect } from "~/components/multi-select";
import { ReadOnlyField } from "~/components/read-only-field";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { getAppLanguage } from "~/i18n";
import {
    addIndividualHuntMachine,
    AddIndividualHuntStatusDialog,
} from "~/screens/hunt/individual-hunt/add-individual-hunt-machine";
import { theme } from "~/theme";
import { SpeciesId } from "~/types/classifiers";
import { Hunt, HuntEventType, HuntPlace } from "~/types/hunts";
import { getEquipmentStatus } from "~/utils/individual-hunt-equipment";
import { DogPicker } from "../dog-picker/dog-picker";
import { getPlannedSpeciesOptions } from "../get-planned-species-options";
import { filterPlannedSpeciesOptions } from "./filter-planned-species-options";
import { getSubmitIndividualHuntValidationErrors } from "./validation";

export type Equipment = "semiAutomatic" | "nightVision" | "lightSource" | "thermalScope";

export type IndividualHuntFormState = {
    notes: string;
    district: number | null;
    plannedFromDate?: Date;
    plannedToDate?: Date;
    selectedPosition: GeoJSON.Position | null;
    species: string;
    equipment: Equipment[];
    propertyName: string;
    selectedSpeciesList: HuntSpecies[];
    selectedSpeciesWithEquipmentList: HuntSpecies[];
    dogs: HuntDog[];
};

function getDefaultAddIndividualHuntFormState(): IndividualHuntFormState {
    return {
        notes: "",
        district: null,
        selectedPosition: null,
        species: "",
        equipment: [],
        propertyName: "",
        selectedSpeciesList: [],
        selectedSpeciesWithEquipmentList: [],
        dogs: [],
    };
}

function getDefaultEditIndividualHuntFormState(hunt: Hunt): IndividualHuntFormState {
    const equipment: Equipment[] = [];
    if (hunt.isNightVisionUsed) {
        equipment.push("nightVision");
    }
    if (hunt.isSemiAutomaticWeaponUsed) {
        equipment.push("semiAutomatic");
    }

    if (hunt.isLightSourceUsed) {
        equipment.push("lightSource");
    }

    if (hunt.isThermalScopeUsed) {
        equipment.push("thermalScope");
    }

    const hasEquipment = equipment.length !== 0;

    const alreadySelectedPosition =
        hunt.meetingPointX !== undefined && hunt.meetingPointY !== undefined
            ? ([hunt.meetingPointX, hunt.meetingPointY] as GeoJSON.Position)
            : null;

    return {
        notes: hunt.notes ?? "",
        district: hunt.districts?.[0]?.id ?? null,
        selectedPosition: alreadySelectedPosition,
        plannedFromDate: new Date(hunt.plannedFrom),
        plannedToDate: new Date(hunt.plannedTo),
        species: "",
        equipment,
        selectedSpeciesList: hasEquipment ? [] : hunt.targetSpecies ?? [],
        selectedSpeciesWithEquipmentList: hasEquipment ? hunt.targetSpecies ?? [] : [],
        propertyName: hunt.propertyName ?? "",
        dogs: hunt.dogs,
    };
}

type IndividualHuntFormProps = {
    hunt?: Hunt;
    huntPlace: HuntPlace;
};

export function IndividualHuntForm(props: IndividualHuntFormProps) {
    const { huntPlace, hunt } = props;
    const profile = useProfile();
    const { t } = useTranslation();
    const service = useInterpret(() => addIndividualHuntMachine);
    const language = getAppLanguage();
    const classifiers = useClassifiers();
    const [individualHunt, setIndividualHunt] = React.useState<IndividualHuntFormState>(() =>
        hunt ? getDefaultEditIndividualHuntFormState(hunt) : getDefaultAddIndividualHuntFormState()
    );

    function onNotesChange(value: string) {
        setIndividualHunt((prevState) => ({ ...prevState, notes: value }));
    }
    const hasEquipment = individualHunt.equipment.length > 0;
    const plannedSpeciesOptions = React.useMemo(() => {
        const appLanguage = getAppLanguage();
        return getPlannedSpeciesOptions(classifiers, appLanguage);
    }, [classifiers]);
    const filteredSpeciesOptions = React.useMemo(() => {
        return filterPlannedSpeciesOptions(plannedSpeciesOptions, huntPlace, hasEquipment);
    }, [plannedSpeciesOptions, huntPlace, hasEquipment]);

    const waterBodySpecies = classifiers.animalSpecies.options
        .filter((option) => option.id === SpeciesId.Birds)
        .map((option) => ({
            label: option.description[language] || "",
            value: String(option.id),
        }));

    const districts = React.useMemo(() => {
        return profile.memberships.map((membership) => ({
            value: membership.huntingDistrict.id,
            label: membership.huntingDistrict.descriptionLv,
        }));
    }, [profile.memberships]);

    const equipmentOptions: Array<{ label: string; value: Equipment }> = [
        { label: t("hunt.equipment.semiAutomatic"), value: "semiAutomatic" },
        { label: t("hunt.equipment.nightVision"), value: "nightVision" },
        { label: t("hunt.equipment.lightSource"), value: "lightSource" },
        { label: t("hunt.equipment.thermalScope"), value: "thermalScope" },
    ];

    function onDistrictChange(district: number) {
        setIndividualHunt((prevState) => ({ ...prevState, district }));
    }

    function onPlannedFromDateChange(date: Date | undefined) {
        setIndividualHunt((prevState) => ({ ...prevState, plannedFromDate: date, plannedToDate: undefined }));
    }

    function onPlannedToDateChange(date: Date | undefined) {
        setIndividualHunt((prevState) => ({ ...prevState, plannedToDate: date }));
    }

    function onSelectPosition(position: GeoJSON.Position) {
        setIndividualHunt((prevState) => ({ ...prevState, selectedPosition: position }));
    }

    function onEquipmentChange(equipment: Equipment[]) {
        setIndividualHunt((prevState) => {
            const newState = { ...prevState, equipment };
            if (equipment.length === 0) {
                newState.selectedSpeciesList = [];
                newState.selectedSpeciesWithEquipmentList = [];
            }
            return newState;
        });
    }

    function onDogsChange(dogs: HuntDog[]) {
        setIndividualHunt((prevState) => ({ ...prevState, dogs }));
    }

    function onPublicWaterChange(propertyName: string) {
        setIndividualHunt((prevState) => ({ ...prevState, propertyName }));
    }

    const isFirstMount = React.useRef(true);

    React.useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        setIndividualHunt((prevState) => ({
            ...prevState,
            selectedSpeciesList: [],
            selectedSpeciesWithEquipmentList: [],
        }));
    }, [huntPlace]);

    function onSubmit() {
        const huntersPersonId = profile.personId;
        const isDistrict = huntPlace === HuntPlace.InTheStation;
        const isInWaterBody = huntPlace === HuntPlace.WaterBody;

        if (isDistrict && !individualHunt.district) {
            return;
        }

        if (isInWaterBody && !individualHunt.propertyName) {
            return;
        }

        if (!huntersPersonId || !individualHunt.plannedFromDate || !individualHunt.plannedToDate) {
            return;
        }

        const { isNightVision, isSemiAutomatic, isLightSourceUsed, isThermalScopeUsed } = getEquipmentStatus(
            individualHunt.equipment
        );

        const hasTargetSpecies = individualHunt.selectedSpeciesList.length > 0;
        const districtId = individualHunt.district ?? 0;

        service.send({
            type: "SUBMIT",
            payload: {
                id: hunt ? hunt.id : undefined,
                plannedFrom: individualHunt.plannedFromDate.toISOString(),
                plannedTo: endOfDay(individualHunt.plannedToDate).toISOString(),
                meetingPoint: individualHunt.selectedPosition
                    ? {
                          x: individualHunt.selectedPosition[0],
                          y: individualHunt.selectedPosition[1],
                      }
                    : undefined,
                huntEventTypeId: HuntEventType.IndividualHunt,
                huntEventPlaceId: huntPlace,
                propertyName: isInWaterBody ? individualHunt.propertyName : "",
                notes: individualHunt.notes ?? "",
                isSemiAutomaticWeaponUsed: !isInWaterBody ? isSemiAutomatic : undefined,
                isNightVisionUsed: !isInWaterBody ? isNightVision : undefined,
                isLightSourceUsed: !isInWaterBody ? isLightSourceUsed : undefined,
                isThermalScopeUsed: !isInWaterBody ? isThermalScopeUsed : undefined,
                guid: Crypto.randomUUID(),
                isTest: false,
                districtIds: isDistrict ? [districtId] : [],
                hunters: [{ personId: huntersPersonId, guid: Crypto.randomUUID() }],
                beaters: [],
                guestHunters: [],
                guestBeaters: [],
                hasTargetSpecies,
                targetSpecies: isInWaterBody
                    ? [{ speciesId: SpeciesId.Birds }]
                    : individualHunt.equipment.length > 0
                    ? individualHunt.selectedSpeciesWithEquipmentList.map((species) => ({
                          speciesId: species.speciesId,
                          permitTypeId: species.permitTypeId,
                      }))
                    : individualHunt.selectedSpeciesList.map((species) => ({
                          speciesId: species.speciesId,
                          permitTypeId: species.permitTypeId,
                      })),
                dogs: individualHunt.dogs,
            },
        });
    }

    const formTexts = React.useMemo(() => {
        const texts: {
            [key in HuntPlace]: {
                title: string;
            };
        } = {
            [HuntPlace.InTheStation]: {
                title: t("hunt.individualHunt.huntingDistrict"),
            },
            [HuntPlace.WaterBody]: {
                title: t("hunt.individualHunt.waterBodyName"),
            },
            [HuntPlace.OutSideStation]: {
                title: t("hunt.individualHunt.outSideStation"),
            },
        };

        return texts[huntPlace];
    }, [t, huntPlace]);

    const validationErrors = getSubmitIndividualHuntValidationErrors({
        ...individualHunt,
        huntPlace,
        hasEquipment,
    });

    const hasValidationErrors = validationErrors.length !== 0;

    const maximumAllowedDate = individualHunt.plannedFromDate ? addDays(individualHunt.plannedFromDate, 1) : undefined;

    return (
        <>
            <View>
                <Spacer size={24} />
                <Input label={t("hunt.notes")} value={individualHunt.notes} onChangeText={onNotesChange} />
                <Spacer size={16} />
                {huntPlace === HuntPlace.InTheStation && (
                    <>
                        <Select
                            options={districts}
                            label={formTexts.title}
                            onChange={onDistrictChange}
                            value={individualHunt.district}
                        />
                        <Spacer size={16} />
                    </>
                )}
                {huntPlace === HuntPlace.WaterBody && (
                    <>
                        <Input
                            label={formTexts.title}
                            value={individualHunt.propertyName}
                            onChangeText={onPublicWaterChange}
                        />
                        <Spacer size={16} />
                    </>
                )}

                <DateInput
                    minimumDate={new Date()}
                    label={t("hunt.individualHunt.date.startDate")}
                    value={individualHunt.plannedFromDate}
                    onChange={onPlannedFromDateChange}
                />
                <Spacer size={16} />
                <DateInput
                    disabled={!individualHunt.plannedFromDate}
                    minimumDate={individualHunt.plannedFromDate}
                    maximumDate={maximumAllowedDate}
                    label={t("hunt.individualHunt.date.endDate")}
                    value={individualHunt.plannedToDate}
                    onChange={onPlannedToDateChange}
                />
                <Spacer size={16} />
                <FieldLabel label={t("hunt.individualHunt.huntPlace")} />
                <Spacer size={16} />
                <View style={styles.map}>
                    <PositionSelect
                        positionType="individualHunt"
                        onMark={onSelectPosition}
                        position={individualHunt.selectedPosition}
                    />
                </View>
                <Spacer size={16} />
                {huntPlace === HuntPlace.WaterBody ? (
                    <>
                        <ReadOnlyField
                            label={t("hunt.individualHunt.huntingSpecies")}
                            value={waterBodySpecies[0]?.label}
                        />
                    </>
                ) : null}

                {huntPlace !== HuntPlace.WaterBody ? (
                    <>
                        <CheckboxList
                            label={t("hunt.equipment.additional")}
                            checkedValues={individualHunt.equipment}
                            onChange={onEquipmentChange}
                            options={equipmentOptions}
                        />
                        <Spacer size={12} />
                    </>
                ) : null}

                {huntPlace !== HuntPlace.WaterBody ? (
                    <MultiSelect
                        label={t("hunt.individualHunt.huntingSpecies")}
                        options={filteredSpeciesOptions}
                        onChange={(values) => {
                            setIndividualHunt((prevState) => ({
                                ...prevState,
                                selectedSpeciesList: !hasEquipment ? values : [],
                                selectedSpeciesWithEquipmentList: hasEquipment ? values : [],
                            }));
                        }}
                        equals={(a, b) => {
                            return a.speciesId === b.speciesId && a.permitTypeId === b.permitTypeId;
                        }}
                        keyExtractor={(value) => {
                            if (value.permitTypeId) {
                                return `${value.speciesId}_${value.permitTypeId}`;
                            }

                            return `${value.speciesId}`;
                        }}
                        values={
                            hasEquipment
                                ? individualHunt.selectedSpeciesWithEquipmentList
                                : individualHunt.selectedSpeciesList
                        }
                    />
                ) : null}

                <Spacer size={12} />
                <DogPicker
                    title={t("hunt.individualHunt.dogs")}
                    dogs={individualHunt.dogs}
                    onDogsChange={onDogsChange}
                />
                <Spacer size={24} />
                {hasValidationErrors && (
                    <>
                        <View style={styles.validationErrorMessages}>
                            {validationErrors.map((error, index) => (
                                <ErrorMessage text={error} key={`${error}-${index}`} />
                            ))}
                        </View>
                        <Spacer size={24} />
                    </>
                )}
                <Button
                    onPress={onSubmit}
                    title={t("hunt.individualHunt.saveHunt")}
                    disabled={validationErrors.length > 0}
                />
            </View>
            <AddIndividualHuntStatusDialog service={service} isEditing={Boolean(hunt)} />
        </>
    );
}

const styles = StyleSheet.create({
    validationErrorMessages: {
        gap: 19,
    },
    map: {
        backgroundColor: theme.color.gray3,
        borderRadius: 8,
        overflow: "hidden",
    },
});
