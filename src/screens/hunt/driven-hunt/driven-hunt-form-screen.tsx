import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useInterpret } from "@xstate/react";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HuntDog } from "~/api";
import { Button } from "~/components/button";
import { CheckboxList } from "~/components/checkbox-button-list";
import { DateInput } from "~/components/date-input";
import { ErrorMessage } from "~/components/error-message";
import { FieldLabel } from "~/components/field-label";
import { Header } from "~/components/header";
import { Input } from "~/components/input";
import { PositionSelect } from "~/components/map/position-select";
import { MultiSelect } from "~/components/multi-select";
import { Select } from "~/components/select";
import { Spacer } from "~/components/spacer";
import { Switch } from "~/components/switch";
import { TimeInput } from "~/components/time-input";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useMemberships } from "~/hooks/use-memberships";
import { useProfile } from "~/hooks/use-profile";
import { useSelectedDistrictId } from "~/hooks/use-selected-district-id";
import { getAppLanguage } from "~/i18n";
import { theme } from "~/theme";
import { TargetSpecies } from "~/types/hunts";
import { MemberRole } from "~/types/mtl";
import { RootNavigatorParams } from "~/types/navigation";
import { formatDateTimeToISO } from "~/utils/format-date-time";
import { DogPicker } from "../dog-picker/dog-picker";
import { getPlannedSpeciesOptions } from "../get-planned-species-options";
import { AddDrivenHuntStatusDialog, addDrivenHuntMachine } from "./add-driven-hunt-machine";
import { BeaterManagementUsingState } from "./beater-management-using-state";
import {
    DrivenHuntFormState,
    getDefaultCopyDrivenHuntFormState,
    getDefaultEditDrivenHuntFormState,
    getDefaultAddDrivenHuntFormState,
} from "./driven-hunt-form-state";
import { HunterManagementUsingState } from "./hunter-management-using-state";
import { getSubmitDrivenHuntValidationErrors } from "./validation";

type DrivenHuntFormScreenProps = NativeStackScreenProps<RootNavigatorParams, "DrivenHuntFormScreen">;

export function DrivenHuntFormScreen({ route }: DrivenHuntFormScreenProps) {
    const { huntToEdit, huntToCopy } = route.params ?? {};
    const { t } = useTranslation();
    const service = useInterpret(() => addDrivenHuntMachine);
    const classifiers = useClassifiers();
    const insets = useSafeAreaInsets();
    const memberships = useMemberships();
    const profile = useProfile();
    const [selectedDistrictId] = useSelectedDistrictId();

    const { districtIds, districtOptions } = React.useMemo(() => {
        const districtIds = new Set<number>();
        const districtOptions: Array<{ label: string; value: number }> = [];
        for (const membership of profile.memberships) {
            if (districtIds.has(membership.huntingDistrictId)) {
                continue;
            }
            if (membership.isAdministrator || membership.isTrustee) {
                districtOptions.push({
                    label: membership.huntingDistrict.descriptionLv,
                    value: membership.huntingDistrictId,
                });
                districtIds.add(membership.huntingDistrictId);
            }
        }
        for (const district of huntToEdit?.districts ?? []) {
            if (districtIds.has(district.id)) {
                continue;
            }
            districtOptions.push({ label: district.descriptionLv, value: district.id });
            districtIds.add(district.id);
        }
        districtOptions.sort((a, b) => a.label.localeCompare(b.label));
        return { districtIds, districtOptions };
    }, [profile.memberships, huntToEdit]);

    const [drivenHunt, setDrivenHunt] = React.useState<DrivenHuntFormState>(() => {
        if (huntToCopy) {
            return getDefaultCopyDrivenHuntFormState(huntToCopy, memberships);
        } else if (huntToEdit) {
            return getDefaultEditDrivenHuntFormState(huntToEdit);
        } else {
            return getDefaultAddDrivenHuntFormState(
                selectedDistrictId && districtIds.has(selectedDistrictId) ? selectedDistrictId : undefined,
                districtOptions
            );
        }
    });

    function onDateSelect(date: Date | undefined) {
        if (date) {
            setDrivenHunt((drivenHunt) => ({ ...drivenHunt, date }));
        }
    }

    function onTimeSelect(time: Date | undefined) {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, time }));
    }

    function onNotesChange(value: string) {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, notesValue: value }));
    }

    function onSelectPosition(position: GeoJSON.Position) {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, selectedPosition: position }));
    }

    function onDistrictsChange(districts: number[]) {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, districts }));
    }

    function onHuntManagerPersonIdChange(value: number) {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, huntManagerPersonId: value }));
    }

    function onHuntAllSpeciesPress() {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, huntAllSpecies: !drivenHunt.huntAllSpecies }));
    }

    function onTargetSpeciesChange(targetSpecies: TargetSpecies[]) {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, targetSpecies }));
    }

    const managerOptions = React.useMemo(() => {
        const districtIds = new Set<number>(drivenHunt.districts);
        const managerIds = new Set<number>();
        const managerOptions: Array<{ label: string; value: number }> = [];

        if (profile.validHuntManagerCardNumber && profile.personId) {
            managerIds.add(profile.personId);
            managerOptions.push({
                label: [profile.firstName, profile.lastName, profile.validHuntManagerCardNumber].join(" "),
                value: profile.personId,
            });
        }

        for (const membership of memberships) {
            if (!districtIds.has(membership.id)) {
                continue;
            }
            for (const member of membership.members) {
                if (managerIds.has(member.id)) {
                    continue;
                }

                if (member.roles.includes(MemberRole.Manager) && member.managerCardNumber) {
                    managerIds.add(member.id);
                    managerOptions.push({
                        label: [member.firstName, member.lastName, member.managerCardNumber].join(" "),
                        value: member.id,
                    });
                }
            }
        }

        managerOptions.sort((a, b) => a.label.localeCompare(b.label));

        return managerOptions;
    }, [drivenHunt.districts, memberships, profile]);

    function onDogsChange(dogs: HuntDog[]) {
        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, dogs }));
    }

    function onSubmit() {
        if (!drivenHunt.date) {
            return;
        }

        const meetingTime = drivenHunt.time
            ? formatDateTimeToISO(
                  new Date(
                      drivenHunt.date.getFullYear(),
                      drivenHunt.date.getMonth(),
                      drivenHunt.date.getDate(),
                      drivenHunt.time.getHours(),
                      drivenHunt.time.getMinutes(),
                      0,
                      0
                  )
              )
            : undefined;
        const plannedFrom =
            meetingTime ??
            formatDateTimeToISO(
                new Date(
                    drivenHunt.date.getFullYear(),
                    drivenHunt.date.getMonth(),
                    drivenHunt.date.getDate(),
                    0,
                    0,
                    0,
                    0
                )
            );
        const plannedTo = formatDateTimeToISO(
            new Date(
                drivenHunt.date.getFullYear(),
                drivenHunt.date.getMonth(),
                drivenHunt.date.getDate(),
                23,
                59,
                59,
                999
            )
        );

        service.send({
            type: "SUBMIT",
            payload: {
                id: huntToEdit ? huntToEdit.id : undefined,
                huntManagerPersonId: drivenHunt.huntManagerPersonId,
                meetingPoint: drivenHunt.selectedPosition
                    ? {
                          x: drivenHunt.selectedPosition[0],
                          y: drivenHunt.selectedPosition[1],
                      }
                    : undefined,
                huntEventTypeId: 2,
                plannedFrom,
                plannedTo,
                meetingTime,
                guid: randomUUID(),
                notes: drivenHunt.notesValue,
                districtIds: drivenHunt.districts,
                hunters: drivenHunt.hunters,
                guestHunters: drivenHunt.guestHunters,
                beaters: drivenHunt.beaters,
                guestBeaters: drivenHunt.guestBeaters,
                targetSpecies: drivenHunt.huntAllSpecies ? [] : drivenHunt.targetSpecies,
                hasTargetSpecies: drivenHunt.huntAllSpecies ? false : true, // if false, then all species are hunted
                dogs: drivenHunt.dogs,
            },
        });
    }

    const plannedSpeciesOptions = React.useMemo(() => {
        const appLanguage = getAppLanguage();
        return getPlannedSpeciesOptions(classifiers, appLanguage);
    }, [classifiers]);

    const minimumData = new Date();
    const validationErrors = getSubmitDrivenHuntValidationErrors(drivenHunt);
    const hasValidationErrors = validationErrors.length !== 0;
    const isTodayDateSelected = drivenHunt.date && drivenHunt.date.toDateString() === minimumData.toDateString();

    return (
        <View style={styles.container}>
            <Header title={huntToEdit ? t("hunt.drivenHunt.editHunt.title") : t("hunt.drivenHunt.addHunt")} />
            <ScrollView
                contentContainerStyle={{
                    paddingRight: insets.right + 16,
                    paddingLeft: insets.left + 16,
                    paddingBottom: insets.bottom + 24,
                }}
            >
                <Spacer size={19} />
                <DateInput
                    minimumDate={minimumData}
                    label={t("dateInput.date")}
                    value={drivenHunt.date}
                    onChange={(date) => {
                        const isToday = date && date.toDateString() === new Date().toDateString();

                        if (isToday && drivenHunt.time && drivenHunt.time < minimumData) {
                            onDateSelect(date);
                            onTimeSelect(undefined);
                            return;
                        }

                        onDateSelect(date);
                    }}
                />
                <Spacer size={16} />
                <Input label={t("hunt.notes")} value={drivenHunt.notesValue} onChangeText={onNotesChange} />
                <Spacer size={16} />
                <TimeInput
                    minimumTime={isTodayDateSelected ? minimumData : undefined}
                    label={t("timeInput.time")}
                    value={drivenHunt.time}
                    onChange={(time) => {
                        if (isTodayDateSelected && time && time < minimumData) {
                            onTimeSelect(minimumData);
                            return;
                        }

                        onTimeSelect(time);
                    }}
                />
                <Spacer size={16} />
                <FieldLabel label={t("hunt.drivenHunt.meetingPlace")} />
                <Spacer size={16} />
                <View style={styles.map}>
                    <PositionSelect
                        positionType="drivenHunt"
                        onMark={onSelectPosition}
                        position={drivenHunt.selectedPosition}
                        activeDistrictId={undefined}
                    />
                </View>
                <Spacer size={16} />
                <CheckboxList
                    label={t("mtl.district")}
                    checkedValues={drivenHunt.districts}
                    onChange={onDistrictsChange}
                    options={districtOptions}
                />
                <Spacer size={16} />
                <Select
                    disabled={managerOptions.length === 0}
                    label={t("hunt.drivenHunt.huntManager")}
                    options={managerOptions}
                    value={drivenHunt.huntManagerPersonId}
                    onChange={onHuntManagerPersonIdChange}
                />
                <Spacer size={12} />
                <Switch
                    label={t("hunt.drivenHunt.huntAllSpecies")}
                    checked={drivenHunt.huntAllSpecies}
                    onPress={onHuntAllSpeciesPress}
                />
                <Spacer size={12} />
                {!drivenHunt.huntAllSpecies ? (
                    <>
                        <MultiSelect
                            label={t("hunt.drivenHunt.speciesToHuntList")}
                            options={plannedSpeciesOptions}
                            values={drivenHunt.targetSpecies}
                            onChange={onTargetSpeciesChange}
                            keyExtractor={(species) => [species.speciesId, species.permitTypeId].join("_")}
                            equals={(a, b) => a.speciesId === b.speciesId && a.permitTypeId === b.permitTypeId}
                        />
                        <Spacer size={16} />
                    </>
                ) : null}
                <HunterManagementUsingState
                    districtIds={drivenHunt.districts}
                    huntManagerPersonId={drivenHunt.huntManagerPersonId}
                    hunters={drivenHunt.hunters}
                    onHuntersChange={(hunters) => {
                        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, hunters }));
                    }}
                    guestHunters={drivenHunt.guestHunters}
                    onGuestHuntersChange={(guestHunters) => {
                        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, guestHunters }));
                    }}
                    beaters={drivenHunt.beaters}
                    districtMembers={huntToEdit?.districtMembers ?? []}
                />
                <Spacer size={16} />
                <BeaterManagementUsingState
                    districtIds={drivenHunt.districts}
                    huntManagerPersonId={drivenHunt.huntManagerPersonId}
                    beaters={drivenHunt.beaters}
                    onBeatersChange={(beaters) => {
                        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, beaters }));
                    }}
                    guestBeaters={drivenHunt.guestBeaters}
                    onGuestBeatersChange={(guestBeaters) => {
                        setDrivenHunt((drivenHunt) => ({ ...drivenHunt, guestBeaters }));
                    }}
                    hunters={drivenHunt.hunters}
                    districtMembers={huntToEdit?.districtMembers ?? []}
                />
                <Spacer size={12} />
                <DogPicker title={t("hunt.drivenHunt.dogsList")} dogs={drivenHunt.dogs} onDogsChange={onDogsChange} />
                <Spacer size={24} />
                {hasValidationErrors ? (
                    <>
                        <View style={styles.validationErrorMessages}>
                            {validationErrors.map((error, index) => (
                                <ErrorMessage text={error} key={`${error}-${index}`} />
                            ))}
                        </View>
                        <Spacer size={24} />
                    </>
                ) : null}
                <Button disabled={hasValidationErrors} onPress={onSubmit} title={t("damage.saveAndSend")} />
            </ScrollView>
            <AddDrivenHuntStatusDialog service={service} editing={huntToEdit !== undefined} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        backgroundColor: theme.color.gray3,
        borderRadius: 8,
        overflow: "hidden",
    },
    validationErrorMessages: {
        gap: 19,
    },
});
