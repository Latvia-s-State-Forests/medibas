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
import { Beater, DistrictMember, GuestBeater, Hunter, HuntEventStatus } from "~/types/hunts";
import { BeaterFormModal } from "./beater-form-modal";
import { BeaterMenuModal } from "./beater-menu-modal";
import { BeaterScannerModal } from "./beater-scanner-modal";
import { MessageModal } from "./message-modal";
import { useMemberOptions } from "./use-member-options";

type BeaterManagementUsingActivitiesProps = {
    huntId: number;
    huntCode: string;
    districtIds: number[];
    huntManagerPersonId: number | undefined;
    beaters: Beater[];
    guestBeaters: GuestBeater[];
    hunters: Hunter[];
    districtMembers: DistrictMember[];
};

export function BeaterManagementUsingActivities(props: BeaterManagementUsingActivitiesProps) {
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

    function onAddBeaters(districtMembers: DistrictMember[]) {
        setIsListVisible(false);
        setIsMenuVisible(false);

        const beaterForPersonId = new Map<number, Beater>();
        for (const beater of props.beaters) {
            if (beater.hunterPersonId) {
                beaterForPersonId.set(beater.hunterPersonId, beater);
            }
        }

        const activities: SimplifiedHuntActivity[] = [];

        for (const districtMember of districtMembers) {
            const beater = beaterForPersonId.get(districtMember.personId);
            // Avoid adding an active beater
            if (beater && beater.statusId !== HuntEventStatus.PausedForParticipants) {
                continue;
            }
            activities.push({
                type: HuntActivityType.AddRegisteredBeater,
                huntId: props.huntId,
                huntCode: props.huntCode,
                participantGuid: beater?.guid ?? randomUUID(),
                userId: districtMember.userId,
                personId: districtMember.personId,
                fullName: districtMember.fullName,
            });
        }

        if (activities.length > 0) {
            createActivities(activities);
        }
    }

    function onAddBeater(userId: number, fullName: string, personId?: number) {
        const beater = props.beaters.find(
            (beater) => beater.userId === userId || (personId && beater.hunterPersonId === personId)
        );
        // Avoid adding an active beater
        if (beater && beater.statusId !== HuntEventStatus.PausedForParticipants) {
            return;
        }
        createActivity({
            type: HuntActivityType.AddRegisteredBeater,
            huntId: props.huntId,
            huntCode: props.huntCode,
            participantGuid: beater?.guid ?? randomUUID(),
            userId,
            personId,
            fullName,
        });
    }

    async function onPauseBeater(guid: string) {
        const beater = props.beaters.find((beater) => beater.guid === guid);
        if (beater) {
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.title", {
                    beater: beater.fullName,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.DeleteRegisteredBeater,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: beater.guid,
                    userId: beater.userId,
                    personId: beater.hunterPersonId,
                    fullName: beater.fullName,
                });
            }
        }
    }

    async function onResumeBeater(guid: string) {
        const beater = props.beaters.find((beater) => beater.guid === guid);
        if (beater) {
            const hunter = props.hunters.find(
                (hunter) =>
                    hunter.personId === beater.hunterPersonId &&
                    hunter.statusId !== HuntEventStatus.PausedForParticipants
            );
            if (hunter) {
                setError({
                    visible: true,
                    title: t("hunt.drivenHunt.beaterManagement.scanner.mismatchFailure.title"),
                    description: t("hunt.drivenHunt.beaterManagement.scanner.mismatchFailure.description", {
                        beater: beater.fullName,
                    }),
                    button: t("hunt.drivenHunt.beaterManagement.scanner.mismatchFailure.button"),
                });
                return;
            }
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.beaterManagement.resumeConfirmation.title", {
                    beater: beater.fullName,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.beaterManagement.resumeConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.beaterManagement.resumeConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.AddRegisteredBeater,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: beater.guid,
                    userId: beater.userId,
                    personId: beater.hunterPersonId,
                    fullName: beater.fullName,
                });
            }
            return;
        }
    }

    function onAddGuestBeater(fullName: string) {
        setIsFormVisible(false);
        setIsMenuVisible(false);
        createActivity({
            type: HuntActivityType.AddGuestBeater,
            huntId: props.huntId,
            huntCode: props.huntCode,
            participantGuid: randomUUID(),
            fullName,
        });
    }

    async function onPauseGuestBeater(guid: string) {
        const guestBeater = props.guestBeaters.find((guestBeater) => guestBeater.guid === guid);
        if (guestBeater) {
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.title", {
                    beater: guestBeater.fullName,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.DeleteGuestBeater,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: guestBeater.guid,
                    fullName: guestBeater.fullName,
                });
            }
        }
    }

    async function onResumeGuestBeater(guid: string) {
        const guestBeater = props.guestBeaters.find((guestBeater) => guestBeater.guid === guid);
        if (guestBeater) {
            const confirmed = await confirm({
                title: t("hunt.drivenHunt.beaterManagement.resumeConfirmation.title", {
                    hunter: guestBeater.fullName,
                }),
                confirmButtonTitle: t("hunt.drivenHunt.beaterManagement.resumeConfirmation.confirm"),
                rejectButtonTitle: t("hunt.drivenHunt.beaterManagement.resumeConfirmation.reject"),
            });
            if (confirmed) {
                createActivity({
                    type: HuntActivityType.AddGuestBeater,
                    huntId: props.huntId,
                    huntCode: props.huntCode,
                    participantGuid: guestBeater.guid,
                    fullName: guestBeater.fullName,
                });
            }
        }
    }

    const beaters = React.useMemo(() => {
        const beaters: Array<{ type: "beater" | "guestBeater"; guid: string; title: string; active: boolean }> = [];

        for (const beater of props.beaters) {
            beaters.push({
                type: "beater",
                guid: beater.guid,
                title: beater.fullName,
                active: beater.statusId !== HuntEventStatus.PausedForParticipants,
            });
        }

        for (const guestBeater of props.guestBeaters) {
            beaters.push({
                type: "guestBeater",
                guid: guestBeater.guid,
                title: guestBeater.fullName,
                active: guestBeater.statusId !== HuntEventStatus.PausedForParticipants,
            });
        }

        beaters.sort((a, b) => a.title.localeCompare(b.title));

        return beaters;
    }, [props.beaters, props.guestBeaters]);

    const options = useMemberOptions({
        districtIds: props.districtIds,
        hunters: props.hunters,
        beaters: props.beaters,
        districtMembers: props.districtMembers,
        showCardNumbers: hasPermissionToManageHunt,
        validateSeasonCard: false,
    });

    return (
        <>
            <View style={styles.container}>
                <View style={styles.titleRow}>
                    <Text size={12} color="gray7" weight="bold" style={styles.title}>
                        {t("hunt.drivenHunt.beaterManagement.title")}
                    </Text>
                    <BorderlessBadge count={beaters.length} variant="default" />
                </View>
                <View style={styles.list}>
                    {beaters.map((beater, index) => {
                        return (
                            <View key={beater.guid} style={styles.listItem}>
                                <Text>{index + 1}.</Text>
                                <Text style={[styles.listItemTitle, beater.active ? styles.active : styles.inactive]}>
                                    {beater.title}
                                </Text>
                                {beater.active ? (
                                    <IconButton
                                        name="trash"
                                        color="gray5"
                                        onPress={() => {
                                            if (beater.type === "beater") {
                                                onPauseBeater(beater.guid);
                                            } else {
                                                onPauseGuestBeater(beater.guid);
                                            }
                                        }}
                                    />
                                ) : (
                                    <IconButton
                                        name="plus"
                                        color="gray5"
                                        onPress={() => {
                                            if (beater.type === "beater") {
                                                onResumeBeater(beater.guid);
                                            } else {
                                                onResumeGuestBeater(beater.guid);
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
                            {t("hunt.drivenHunt.beaterManagement.add")}
                        </Text>
                        <MediumIcon name="plus" color="teal" />
                    </TouchableOpacity>
                </View>
            </View>
            <BeaterMenuModal
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
                    title={t("hunt.drivenHunt.beaterManagement.list.title")}
                    options={options}
                    values={[]}
                    keyExtractor={(option) => option.personId.toString()}
                    equals={(a, b) => a.personId === b.personId}
                    onConfirm={onAddBeaters}
                    onReject={() => {
                        setIsListVisible(false);
                    }}
                />
                <BeaterScannerModal
                    visible={isScannerVisible}
                    hunters={props.hunters}
                    beaters={props.beaters}
                    onConfirm={onAddBeater}
                    onReject={() => {
                        setIsScannerVisible(false);
                    }}
                />
                <BeaterFormModal
                    visible={isFormVisible}
                    onConfirm={onAddGuestBeater}
                    onReject={() => {
                        setIsFormVisible(false);
                    }}
                />
            </BeaterMenuModal>
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
