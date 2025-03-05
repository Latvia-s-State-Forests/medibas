import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { isBefore, isSameDay, startOfDay } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HuntSpecies } from "~/api";
import { ActionButton } from "~/components/action-button";
import { Button } from "~/components/button";
import { CheckboxList } from "~/components/checkbox-button-list";
import { ConfirmRejectIndividualHunt } from "~/components/confirm-reject-individual-hunt";
import { useConfirmationDialog } from "~/components/confirmation-dialog-provider";
import { Dialog } from "~/components/dialog";
import { ErrorMessage } from "~/components/error-message";
import { Header } from "~/components/header";
import { useHuntActivitiesContext } from "~/components/hunt-activities-provider";
import { SmallIcon, SmallIconName } from "~/components/icon";
import { ReadOnlyField } from "~/components/read-only-field";
import { Spacer } from "~/components/spacer";
import { Text } from "~/components/text";
import { configuration } from "~/configuration";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useHunt } from "~/hooks/use-hunt";
import { usePermissions } from "~/hooks/use-permissions";
import { DEFAULT_APP_LANGUAGE, getAppLanguage } from "~/i18n";
import { logger } from "~/logger";
import { Color, theme } from "~/theme";
import { HuntActivityType } from "~/types/hunt-activities";
import { Hunt, HuntEventStatus, HuntPlace } from "~/types/hunts";
import { RootNavigatorParams } from "~/types/navigation";
import { formatDate } from "~/utils/format-date-time";
import { getEquipmentStatus } from "~/utils/individual-hunt-equipment";
import { HuntedSpeciesList } from "../driven-hunt/lists/hunted-species-list";
import { Modal } from "../driven-hunt/modal";
import { getPlannedSpeciesOptions } from "../get-planned-species-options";
import { filterPlannedSpeciesOptions } from "./filter-planned-species-options";
import { Equipment } from "./individual-hunt-form";
import { AddSpecialEquipmentMultiSelect } from "./species-with-equipment";

type IndividualHuntDetailScreenProps = NativeStackScreenProps<RootNavigatorParams, "IndividualHuntDetailScreen">;

export function IndividualHuntDetailScreen({ navigation, route }: IndividualHuntDetailScreenProps) {
    const hunt = useHunt(route.params.huntId);

    if (!hunt) {
        logger.error(`Individual hunt with id ${route.params.huntId} not available`);
        navigation.goBack();
        return null;
    }

    return <Content hunt={hunt} />;
}

type ContentProps = {
    hunt: Hunt;
};

function Content({ hunt }: ContentProps) {
    const navigation = useNavigation();
    const { createActivity } = useHuntActivitiesContext();
    const { t } = useTranslation();
    const language = getAppLanguage();
    const insets = useSafeAreaInsets();
    const permissions = usePermissions();
    const classifiers = useClassifiers();
    const { confirm } = useConfirmationDialog();
    const [showHuntDialog, setSowHuntDialog] = React.useState(false);
    const equipmentSpecies = hunt.targetSpecies.filter((species) =>
        configuration.hunt.plannedSpeciesUsingEquipment.includes(species.speciesId)
    );
    const [showEquipmentDialog, setShowEquipmentDialog] = React.useState(false);
    const [selectedSpeciesWithEquipmentList, setSelectedSpeciesWithEquipmentList] =
        React.useState<HuntSpecies[]>(equipmentSpecies);
    const districtId = hunt.districts[0]?.id ?? 0;
    const canApproveOrRejectHunt = permissions.approveOrRejectIndividualHunt(districtId);
    const isApprovalPending = !hunt.isIndividualHuntApproved && !hunt.reasonForRejection;
    const isHunter = permissions.isHunterInHunt(hunt.hunters);
    const isPastPlannedDate = hunt.plannedTo && isBefore(new Date(hunt.plannedTo), startOfDay(new Date()));
    const isInStation = hunt.huntEventPlaceId === HuntPlace.InTheStation;
    const isHuntActive = hunt.huntEventStatusId === HuntEventStatus.Active;
    const isConcluded = hunt.huntEventStatusId === HuntEventStatus.Concluded;
    const isApproved =
        hunt.huntEventPlaceId === HuntPlace.InTheStation ? hunt.isIndividualHuntApproved !== false : true;
    const hunterIsAdminOrTrusteeInDistrict = canApproveOrRejectHunt && isHunter;
    const canHuntBeStartOrConcluded = isApproved && isHunter && !isConcluded && !isPastPlannedDate;
    const canHuntBeEdited = isApprovalPending && isHunter && !isConcluded && !isHuntActive;
    const canHuntBeApprovedOrRejected =
        isInStation &&
        !isConcluded &&
        !isHuntActive &&
        isApprovalPending &&
        canApproveOrRejectHunt &&
        !hunterIsAdminOrTrusteeInDistrict;

    function getPlaceName(placeId: HuntPlace | undefined) {
        if (placeId === undefined) {
            return "";
        }

        const HUNT_PLACE_ID: {
            [key in HuntPlace]: string;
        } = {
            1: t("hunt.individualHunt.inTheStation"),
            2: t("hunt.individualHunt.waterBody"),
            3: t("hunt.individualHunt.outSideStation"),
        };

        return HUNT_PLACE_ID[placeId];
    }

    const dateFrom = formatDate(hunt.plannedFrom ?? "");
    const dateTo = formatDate(hunt.plannedTo ?? "");
    const district = hunt.districts?.map((d) => d.descriptionLv).join(", ");
    const waterBody = hunt.propertyName;

    const hunterNameAndCardNumber = hunt.hunters?.map((h) => `${h.fullName} ${h.huntersCardNumber}`).join(", ");

    const huntedSpecies = React.useMemo(() => {
        const allSpecies = getPlannedSpeciesOptions(classifiers, language);

        return allSpecies
            .filter((species) => {
                return hunt.targetSpecies?.some(
                    (s) => s.speciesId === species.value.speciesId && s.permitTypeId === species.value.permitTypeId
                );
            })
            .map((species) => species.label)
            .join(", ");
    }, [classifiers, language, hunt.targetSpecies]);

    const huntDogs = React.useMemo(() => {
        const dogs: string[] = [];

        const breedById = new Map<number, string>();
        for (const breed of classifiers.dogBreeds.options) {
            const description = breed.description[language] ?? breed.description[DEFAULT_APP_LANGUAGE] ?? "??";
            breedById.set(breed.id, description);
        }

        const subBreedById = new Map<number, string>();
        for (const subBreed of classifiers.dogSubbreeds.options) {
            const breed = breedById.get(subBreed.breedId);
            if (breed) {
                const description =
                    subBreed.description[language] ?? subBreed.description[DEFAULT_APP_LANGUAGE] ?? "??";
                subBreedById.set(subBreed.id, `${breed} (${description})`);
            }
        }

        for (const dog of hunt.dogs) {
            if (dog.dogSubbreedId) {
                const subBreed = subBreedById.get(dog.dogSubbreedId);
                if (subBreed) {
                    dogs.push(`${subBreed} × ${dog.count}`);
                }
            } else if (dog.dogBreedOther) {
                dogs.push(`${t("hunt.individualHunt.otherBreed", { otherBreed: dog.dogBreedOther })} × ${dog.count}`);
            } else {
                const breed = breedById.get(dog.dogBreedId);
                if (breed) {
                    dogs.push(`${breed} × ${dog.count}`);
                }
            }
        }

        dogs.sort((a, b) => a.localeCompare(b));

        return dogs.join(", ");
    }, [t, classifiers, language, hunt.dogs]);

    function getStatus(hunt: Hunt): { color: Color; icon: SmallIconName; text: string } | undefined {
        if (hunt.isIndividualHuntApproved) {
            return {
                color: "success",
                icon: "valid",
                text: t("hunt.individualHunt.status.seen"),
            };
        } else if (hunt.reasonForRejection) {
            return {
                color: "orange",
                icon: "denied",
                text: t("hunt.individualHunt.status.declined"),
            };
        }
        return undefined;
    }

    const canAddEquipment =
        isHunter && hunt.huntEventPlaceId !== HuntPlace.WaterBody && hunt.huntEventStatusId === HuntEventStatus.Active;

    const EQUIPMENT_CONFIG = {
        isNightVisionUsed: {
            key: "nightVision",
            translation: "hunt.equipment.nightVision",
        },
        isSemiAutomaticWeaponUsed: {
            key: "semiAutomatic",
            translation: "hunt.equipment.semiAutomatic",
        },
        isLightSourceUsed: {
            key: "lightSource",
            translation: "hunt.equipment.lightSource",
        },
        isThermalScopeUsed: {
            key: "thermalScope",
            translation: "hunt.equipment.thermalScope",
        },
    } as const;

    function getEquipmentData(hunt: Hunt, useTranslation: boolean = false): Array<Equipment | string> {
        const equipmentData: Array<Equipment | string> = [];

        for (const [huntKey, config] of Object.entries(EQUIPMENT_CONFIG)) {
            if (hunt[huntKey as keyof Hunt]) {
                equipmentData.push(useTranslation ? t(config.translation) : config.key);
            }
        }

        return equipmentData;
    }

    function getEquipmentKeys(hunt: Hunt): Equipment[] {
        return getEquipmentData(hunt) as Equipment[];
    }

    const [equipmentList, setEquipmentList] = React.useState<{ equipment: Equipment[] }>({
        equipment: hunt ? getEquipmentKeys(hunt) : [],
    });

    function getEquipmentTranslations(hunt: Hunt): string {
        return getEquipmentData(hunt, true).join(", ");
    }

    const hasEquipment = equipmentList.equipment.length > 0;
    function onEquipmentChange(equipment: Equipment[]) {
        setEquipmentList((prevState) => ({
            ...prevState,
            equipment,
        }));
    }

    const equipmentOptions: Array<{ label: string; value: Equipment }> = Object.values(EQUIPMENT_CONFIG).map(
        (config) => ({
            label: t(config.translation),
            value: config.key,
        })
    );

    const plannedSpeciesOptions = React.useMemo(() => {
        const appLanguage = getAppLanguage();
        return getPlannedSpeciesOptions(classifiers, appLanguage);
    }, [classifiers]);

    const filteredSpeciesOptions = React.useMemo(() => {
        if (hunt.huntEventPlaceId) {
            return filterPlannedSpeciesOptions(plannedSpeciesOptions, hunt.huntEventPlaceId, hasEquipment);
        }
        return [];
    }, [plannedSpeciesOptions, hunt.huntEventPlaceId, hasEquipment]);

    const { isNightVision, isSemiAutomatic, isLightSourceUsed, isThermalScopeUsed } = getEquipmentStatus(
        equipmentList.equipment
    );

    function getSubmitHuntValidationErrors({ plannedFrom, plannedTo }: Hunt): string[] {
        const errors: string[] = [];
        const isHuntScheduledToday =
            isSameDay(new Date(), new Date(plannedFrom)) || isSameDay(new Date(), new Date(plannedTo));

        if (!isHuntScheduledToday) {
            errors.push(t("hunt.individualHunt.huntIsNotScheduledToday"));
        }
        return errors;
    }

    if (!hunt) {
        return null;
    }

    const statusOptions = getStatus(hunt);
    const validationErrors = getSubmitHuntValidationErrors(hunt);
    const equalHuntStartEndDates = dateTo === dateFrom;
    function onCloseAdditionalEquipmentDialog(): void {
        setShowEquipmentDialog(false);
        setSelectedSpeciesWithEquipmentList(equipmentSpecies);
        setEquipmentList({
            equipment: getEquipmentKeys(hunt),
        });
    }

    async function onSaveAdditionalEquipment(): Promise<void> {
        const confirmed = await confirm({
            title: t("hunt.individualHunt.addEquipmentConfirmation.title", {
                huntCode: hunt.vmdCode,
            }),
            confirmButtonTitle: t("hunt.individualHunt.addEquipmentConfirmation.confirm"),
            rejectButtonTitle: t("hunt.individualHunt.addEquipmentConfirmation.reject"),
        });
        if (confirmed) {
            createActivity({
                type: HuntActivityType.AddSpeciesAndGear,
                targetSpecies: selectedSpeciesWithEquipmentList,
                isSemiAutomaticWeaponUsed: isSemiAutomatic,
                isLightSourceUsed,
                isNightVisionUsed: isNightVision,
                isThermalScopeUsed,
                huntId: hunt.id,
                huntCode: hunt.vmdCode,
            });
            setShowEquipmentDialog(false);
        }
    }

    return (
        <View style={styles.container}>
            <Header
                title={hunt.vmdCode ?? ""}
                showEditButton={canHuntBeEdited}
                onEditButtonPress={() => {
                    if (!canHuntBeEdited) {
                        return;
                    }

                    navigation.navigate("IndividualHuntFormScreen", { hunt });
                }}
            />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingRight: insets.right + 16,
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                <View style={styles.formContentContainer}>
                    <ReadOnlyField label={t("hunt.individualHunt.huntCode")} value={hunt.vmdCode ?? ""} />
                    {hunt.notes ? <ReadOnlyField label={t("hunt.individualHunt.notes")} value={hunt.notes} /> : null}
                    <ReadOnlyField
                        label={t("hunt.individualHunt.huntType")}
                        value={getPlaceName(hunt.huntEventPlaceId)}
                    />
                    {hunt.huntEventPlaceId === HuntPlace.InTheStation && (
                        <ReadOnlyField label={t("hunt.individualHunt.huntingDistrict")} value={district ?? ""} />
                    )}
                    {hunt.huntEventPlaceId === HuntPlace.WaterBody && (
                        <ReadOnlyField label={t("hunt.individualHunt.waterBodyName")} value={waterBody ?? ""} />
                    )}
                    <ReadOnlyField
                        label={
                            equalHuntStartEndDates
                                ? t("hunt.individualHunt.date.huntDate")
                                : t("hunt.individualHunt.date.startDate")
                        }
                        value={dateFrom}
                    />
                    {!equalHuntStartEndDates ? (
                        <ReadOnlyField label={t("hunt.individualHunt.date.endDate")} value={dateTo} />
                    ) : null}
                    {huntDogs.length > 0 && <ReadOnlyField label={t("hunt.individualHunt.dogs")} value={huntDogs} />}
                    {huntedSpecies.length > 0 && (
                        <ReadOnlyField label={t("hunt.individualHunt.huntingSpecies")} value={huntedSpecies} />
                    )}
                    {isConcluded ? <HuntedSpeciesList hunt={hunt} /> : null}
                    {getEquipmentTranslations(hunt).length > 0 && (
                        <ReadOnlyField label={t("hunt.equipment.additional")} value={getEquipmentTranslations(hunt)} />
                    )}
                    {isInStation && hunterNameAndCardNumber && (
                        <ReadOnlyField label={t("hunt.individualHunt.hunter")} value={hunterNameAndCardNumber} />
                    )}

                    {isInStation && !isConcluded && !isPastPlannedDate && statusOptions ? (
                        <ReadOnlyField
                            label={t("hunt.individualHunt.status.status")}
                            value={statusOptions.text}
                            icon={<SmallIcon name={statusOptions.icon} color={statusOptions.color} />}
                        />
                    ) : null}

                    {hunt.reasonForRejection && !isConcluded && (
                        <ReadOnlyField
                            label={t("hunt.individualHunt.reasonForRejection")}
                            value={hunt.reasonForRejection}
                        />
                    )}
                </View>
                {canHuntBeApprovedOrRejected && hunt.id && <ConfirmRejectIndividualHunt huntId={hunt.id} />}
                {validationErrors.length > 0 && canHuntBeStartOrConcluded && (
                    <>
                        <View style={styles.validationErrorMessages}>
                            {validationErrors.map((error, index) => (
                                <ErrorMessage text={error} key={`${error}-${index}`} />
                            ))}
                        </View>
                    </>
                )}
                {canAddEquipment ? (
                    <View>
                        <Spacer size={24} />
                        <ActionButton
                            disabled={validationErrors.length > 0}
                            title={t("hunt.individualHunt.addAdditionalEquipment")}
                            iconName={"edit"}
                            onPress={() => {
                                setShowEquipmentDialog(true);
                            }}
                        />
                    </View>
                ) : null}
                {canHuntBeStartOrConcluded ? (
                    <View>
                        <Spacer size={canAddEquipment ? 16 : 24} />
                        <ActionButton
                            disabled={validationErrors.length > 0}
                            title={
                                isHuntActive
                                    ? t("hunt.individualHunt.concludeHunt")
                                    : t("hunt.individualHunt.startHunt")
                            }
                            iconName={isHuntActive ? "unlock" : "play"}
                            onPress={() => {
                                setSowHuntDialog(true);
                            }}
                        />
                    </View>
                ) : null}
                <Modal
                    visible={showEquipmentDialog}
                    onBackButtonPress={() => setShowEquipmentDialog(false)}
                    children={
                        <View>
                            <Text style={styles.title} size={18} weight="bold">
                                {t("hunt.individualHunt.addAdditionalEquipment")}
                            </Text>
                            <CheckboxList
                                label={t("hunt.equipment.additional")}
                                checkedValues={equipmentList.equipment}
                                onChange={onEquipmentChange}
                                options={equipmentOptions}
                            />
                            <Spacer size={12} />
                            <AddSpecialEquipmentMultiSelect
                                label={t("hunt.individualHunt.huntingSpecies")}
                                options={filteredSpeciesOptions}
                                values={selectedSpeciesWithEquipmentList}
                                onChange={(values) => {
                                    setSelectedSpeciesWithEquipmentList(values);
                                }}
                                disabled={!hasEquipment}
                            />
                            <Spacer size={24} />
                            <Button
                                disabled={!hasEquipment || selectedSpeciesWithEquipmentList.length === 0}
                                title={t("general.save")}
                                onPress={onSaveAdditionalEquipment}
                            />
                            <Spacer size={8} />
                            <Button
                                variant="secondary-outlined"
                                title={t("general.cancel")}
                                onPress={onCloseAdditionalEquipmentDialog}
                            />
                        </View>
                    }
                />
                <Dialog
                    visible={showHuntDialog}
                    icon={isHuntActive ? "lock" : "hunt"}
                    title={
                        isHuntActive
                            ? t("hunt.individualHunt.concludeModal", { hunt: hunt.vmdCode ?? "" })
                            : t("hunt.individualHunt.startModal", { hunt: hunt.vmdCode ?? "" })
                    }
                    buttons={
                        <>
                            <Button
                                title={
                                    isHuntActive
                                        ? t("hunt.individualHunt.concludeHunt")
                                        : t("hunt.individualHunt.startHunt")
                                }
                                onPress={() => {
                                    setSowHuntDialog(false);
                                    if (isHuntActive) {
                                        createActivity({
                                            type: HuntActivityType.EndHunt,
                                            huntId: hunt.id,
                                            huntCode: hunt.vmdCode,
                                        });
                                    } else {
                                        createActivity({
                                            type: HuntActivityType.StartHunt,
                                            huntId: hunt.id,
                                            huntCode: hunt.vmdCode,
                                        });
                                    }
                                }}
                            />
                            <Button
                                title={t("modal.cancel")}
                                variant="secondary-outlined"
                                onPress={() => {
                                    setSowHuntDialog(false);
                                }}
                            />
                        </>
                    }
                    onBackButtonPress={() => {
                        setSowHuntDialog(false);
                    }}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        flexGrow: 1,
        paddingTop: 24,
    },
    formContentContainer: {
        flex: 1,
        gap: 24,
    },
    validationErrorMessages: {
        gap: 19,
    },
    title: {
        marginTop: 8,
        marginBottom: 16,
    },
});
