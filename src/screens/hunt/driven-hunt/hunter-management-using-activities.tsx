import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { Button } from "~/components/button";
import { useConfirmationDialog } from "~/components/confirmation-dialog-provider";
import { useHuntActivitiesContext } from "~/components/hunt-activities-provider";
import { MediumIcon } from "~/components/icon";
import { IconButton } from "~/components/icon-button";
import { MultiSelectModal } from "~/components/multi-select-modal";
import { Text } from "~/components/text";
import { usePermissions } from "~/hooks/use-permissions";
import { theme } from "~/theme";
import { HuntActivityType, SimplifiedHuntActivity } from "~/types/hunt-activities";
import { Beater, DistrictMember, GuestHunter, Hunter, HuntEventStatus } from "~/types/hunts";
import { HunterFormModal } from "./hunter-form-modal";
import { HunterMenuModal } from "./hunter-menu-modal";
import { HunterScannerModal } from "./hunter-scanner-modal";
import { MessageModal } from "./message-modal";
import { useMemberOptions } from "./use-member-options";

type HunterManagementUsingActivitiesProps = {
    huntId: number;
    huntCode: string;
    districtIds: number[];
    huntManagerPersonId: number | undefined;
    hunters: Hunter[];
    guestHunters: GuestHunter[];
    beaters: Beater[];
    districtMembers: DistrictMember[];
};

export function HunterManagementUsingActivities(props: HunterManagementUsingActivitiesProps) {
    const { t } = useTranslation();
    const { confirm } = useConfirmationDialog();
    const { createActivity, createActivities } = useHuntActivitiesContext();
    const permissions = usePermissions();
    const hasPermissionToManageHunt = permissions.manageDrivenHunt(props.huntManagerPersonId);

    const [isMenuVisible, setIsMenuVisible] = React.useState(false);
    const [isListVisible, setIsListVisible] = React.useState(false);
    const [isScannerVisible, setIsScannerVisible] = React.useState(false);
    const [isFormVisible, setIsFormVisible] = React.useState(false);

    const [error, setError] = React.useState<{ visible: boolean; title: string; description: string; button: string }>({
        visible: false,
        title: "",
        description: "",
        button: "",
    });

    function onAddHunters(districtMembers: DistrictMember[]) {
        setIsListVisible(false);
        setIsMenuVisible(false);

        const hunterForPersonId = new Map<number, Hunter>();
        for (const hunter of props.hunters) {
            hunterForPersonId.set(hunter.personId, hunter);
        }

        const activities: SimplifiedHuntActivity[] = [];

        for (const districtMember of districtMembers) {
            const hunter = hunterForPersonId.get(districtMember.personId);
            // Avoid adding an active hunter
            if (hunter && hunter.statusId !== HuntEventStatus.PausedForParticipants) {
                continue;
            }
            activities.push({
                type: HuntActivityType.AddRegisteredHunter,
                huntId: props.huntId,
                huntCode: props.huntCode,
                participantGuid: hunter?.guid ?? randomUUID(),
                personId: districtMember.personId,
                fullName: districtMember.fullName,
                huntersCardNumber: districtMember.huntersCardNumber,
            });
        }

        if (activities.length > 0) {
            createActivities(activities);
        }
    }

    function onAddHunter(personId: number, fullName: string, huntersCardNumber: string) {
        const hunter = props.hunters.find((hunter) => hunter.personId === personId);
        // Avoid adding an active hunter
        if (hunter && hunter.statusId !== HuntEventStatus.PausedForParticipants) {
            return;
        }
        createActivity({
            type: HuntActivityType.AddRegisteredHunter,
            huntId: props.huntId,
            huntCode: props.huntCode,
            participantGuid: hunter?.guid ?? randomUUID(),
            personId,
            fullName,
            huntersCardNumber,
        });
    }

    async function onPauseHunter(guid: string) {
        const hunter = props.hunters.find((hunter) => hunter.guid === guid);
        if (hunter) {
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.title", {
                    hunter: hunter.fullName + " " + hunter.huntersCardNumber,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.DeleteRegisteredHunter,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: hunter.guid,
                    fullName: hunter.fullName,
                    huntersCardNumber: hunter.huntersCardNumber,
                    personId: hunter.personId,
                });
            }
            return;
        }
    }

    async function onResumeHunter(guid: string) {
        const hunter = props.hunters.find((hunter) => hunter.guid === guid);
        if (hunter) {
            const beater = props.beaters.find(
                (beater) =>
                    beater.hunterPersonId === hunter.personId &&
                    beater.statusId !== HuntEventStatus.PausedForParticipants
            );
            if (beater) {
                setError({
                    visible: true,
                    title: t("hunt.drivenHunt.hunterManagement.scanner.mismatchFailure.title"),
                    description: t("hunt.drivenHunt.hunterManagement.scanner.mismatchFailure.description", {
                        hunter: hunter.fullName + " " + hunter.huntersCardNumber,
                    }),
                    button: t("hunt.drivenHunt.hunterManagement.scanner.mismatchFailure.button"),
                });
                return;
            }
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.hunterManagement.resumeConfirmation.title", {
                    hunter: hunter.fullName + " " + hunter.huntersCardNumber,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.hunterManagement.resumeConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.hunterManagement.resumeConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.AddRegisteredHunter,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: hunter.guid,
                    personId: hunter.personId,
                    fullName: hunter.fullName,
                    huntersCardNumber: hunter.huntersCardNumber,
                });
            }
            return;
        }
    }

    function onAddGuestHunter(fullName: string, guestHuntersCardNumber: string) {
        setIsFormVisible(false);
        setIsMenuVisible(false);

        const guestHunter = props.guestHunters.find(
            (guestHunter) => guestHunter.guestHuntersCardNumber === guestHuntersCardNumber
        );
        // Avoid adding an active hunter
        if (guestHunter && guestHunter.statusId !== HuntEventStatus.PausedForParticipants) {
            return;
        }
        createActivity({
            type: HuntActivityType.AddGuestHunter,
            huntId: props.huntId,
            huntCode: props.huntCode,
            participantGuid: guestHunter?.guid ?? randomUUID(),
            fullName,
            guestHuntersCardNumber,
        });
    }

    async function onPauseGuestHunter(guid: string) {
        const guestHunter = props.guestHunters.find((guestHunter) => guestHunter.guid === guid);
        if (guestHunter) {
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.title", {
                    hunter: guestHunter.fullName + " " + guestHunter.guestHuntersCardNumber,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.DeleteGuestHunter,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: guestHunter.guid,
                    fullName: guestHunter.fullName,
                    guestHuntersCardNumber: guestHunter.guestHuntersCardNumber,
                });
            }
        }
    }

    async function onResumeGuestHunter(guid: string) {
        const guestHunter = props.guestHunters.find((guestHunter) => guestHunter.guid === guid);
        if (guestHunter) {
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.hunterManagement.resumeConfirmation.title", {
                    hunter: guestHunter.fullName + " " + guestHunter.guestHuntersCardNumber,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.hunterManagement.resumeConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.hunterManagement.resumeConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.AddGuestHunter,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: guestHunter.guid,
                    fullName: guestHunter.fullName,
                    guestHuntersCardNumber: guestHunter.guestHuntersCardNumber,
                });
            }
        }
    }

    const hunters = React.useMemo(() => {
        const hunters: Array<{ type: "hunter" | "guestHunter"; guid: string; title: string; active: boolean }> = [];

        for (const hunter of props.hunters) {
            hunters.push({
                type: "hunter",
                guid: hunter.guid,
                title: hasPermissionToManageHunt ? hunter.fullName + " " + hunter.huntersCardNumber : hunter.fullName,
                active: hunter.statusId !== HuntEventStatus.PausedForParticipants,
            });
        }

        for (const guestHunter of props.guestHunters) {
            hunters.push({
                type: "guestHunter",
                guid: guestHunter.guid,
                title: hasPermissionToManageHunt
                    ? guestHunter.fullName + " " + guestHunter.guestHuntersCardNumber
                    : guestHunter.fullName,
                active: guestHunter.statusId !== HuntEventStatus.PausedForParticipants,
            });
        }

        hunters.sort((a, b) => a.title.localeCompare(b.title));

        return hunters;
    }, [props.hunters, props.guestHunters, hasPermissionToManageHunt]);

    const options = useMemberOptions({
        districtIds: props.districtIds,
        hunters: props.hunters,
        beaters: props.beaters,
        districtMembers: props.districtMembers,
        showCardNumbers: hasPermissionToManageHunt,
        validateSeasonCard: true,
    });

    return (
        <>
            <View style={styles.container}>
                <View style={styles.titleRow}>
                    <Text size={12} color="gray7" weight="bold" style={styles.title}>
                        {t("hunt.drivenHunt.hunterManagement.title")}
                    </Text>
                    <BorderlessBadge count={hunters.length} variant="default" />
                </View>
                <View style={styles.list}>
                    {hunters.map((hunter, index) => {
                        return (
                            <View key={hunter.guid} style={styles.listItem}>
                                <Text>{index + 1}.</Text>
                                <Text style={[styles.listItemTitle, hunter.active ? styles.active : styles.inactive]}>
                                    {hunter.title}
                                </Text>
                                {hunter.active ? (
                                    <IconButton
                                        name="trash"
                                        color="gray5"
                                        onPress={() => {
                                            if (hunter.type === "hunter") {
                                                onPauseHunter(hunter.guid);
                                            } else {
                                                onPauseGuestHunter(hunter.guid);
                                            }
                                        }}
                                    />
                                ) : (
                                    <IconButton
                                        name="plus"
                                        color="gray5"
                                        onPress={() => {
                                            if (hunter.type === "hunter") {
                                                onResumeHunter(hunter.guid);
                                            } else {
                                                onResumeGuestHunter(hunter.guid);
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        );
                    })}
                    <TouchableOpacity
                        onPress={() => {
                            setIsMenuVisible(true);
                        }}
                        activeOpacity={0.75}
                        style={styles.addButton}
                    >
                        <Text weight="bold" color="teal">
                            {t("hunt.drivenHunt.hunterManagement.add")}
                        </Text>
                        <MediumIcon name="plus" color="teal" />
                    </TouchableOpacity>
                </View>
            </View>
            <HunterMenuModal
                visible={isMenuVisible}
                onListOpen={() => {
                    setIsListVisible(true);
                }}
                onScannerOpen={() => {
                    setIsScannerVisible(true);
                }}
                onFormOpen={() => {
                    setIsFormVisible(true);
                }}
                onCancel={() => {
                    setIsMenuVisible(false);
                    setIsListVisible(false);
                    setIsScannerVisible(false);
                    setIsFormVisible(false);
                }}
            >
                <MultiSelectModal
                    visible={isListVisible}
                    title={t("hunt.drivenHunt.hunterManagement.list.title")}
                    options={options}
                    values={[]}
                    keyExtractor={(option) => option.personId.toString()}
                    equals={(a, b) => a.personId === b.personId}
                    onConfirm={onAddHunters}
                    onReject={() => {
                        setIsListVisible(false);
                    }}
                />
                <HunterScannerModal
                    visible={isScannerVisible}
                    hunters={props.hunters}
                    beaters={props.beaters}
                    onConfirm={onAddHunter}
                    onReject={() => {
                        setIsScannerVisible(false);
                    }}
                />
                <HunterFormModal
                    visible={isFormVisible}
                    guestHunters={props.guestHunters}
                    onConfirm={onAddGuestHunter}
                    onReject={() => {
                        setIsFormVisible(false);
                    }}
                />
            </HunterMenuModal>
            <MessageModal
                visible={error.visible}
                icon="failure"
                title={error.title}
                description={error.description}
                buttons={
                    <Button
                        title={error.button}
                        onPress={() => {
                            setError((error) => ({ ...error, visible: false }));
                        }}
                    />
                }
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        gap: 10,
        paddingRight: 20,
        paddingVertical: 10,
    },
    title: {
        flex: 1,
    },
    list: {
        borderTopWidth: 1,
        borderTopColor: theme.color.gray2,
    },
    listItem: {
        minHeight: 56,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 4,
        borderBottomColor: theme.color.gray2,
        borderBottomWidth: 1,
        paddingRight: 4,
    },
    listItemTitle: {
        flex: 1,
    },
    active: {
        textDecorationLine: "none",
    },
    inactive: {
        textDecorationLine: "line-through",
    },
    addButton: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        height: 56,
        borderBottomWidth: 1,
        borderColor: theme.color.gray2,
        paddingRight: 16,
    },
});
