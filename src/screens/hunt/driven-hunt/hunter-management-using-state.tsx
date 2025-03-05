import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BorderlessBadge } from "~/components/borderless-badge";
import { useConfirmationDialog } from "~/components/confirmation-dialog-provider";
import { MediumIcon } from "~/components/icon";
import { IconButton } from "~/components/icon-button";
import { MultiSelectModal } from "~/components/multi-select-modal";
import { Text } from "~/components/text";
import { usePermissions } from "~/hooks/use-permissions";
import { theme } from "~/theme";
import { Beater, DistrictMember, GuestHunter, Hunter, HuntEventStatus } from "~/types/hunts";
import { HunterFormModal } from "./hunter-form-modal";
import { HunterMenuModal } from "./hunter-menu-modal";
import { HunterScannerModal } from "./hunter-scanner-modal";
import { useMemberOptions } from "./use-member-options";

type HunterManagementUsingStateProps = {
    districtIds: number[];
    huntManagerPersonId: number | undefined;
    hunters: Hunter[];
    onHuntersChange: (hunters: Hunter[]) => void;
    guestHunters: GuestHunter[];
    onGuestHuntersChange: (guestHunters: GuestHunter[]) => void;
    beaters: Beater[];
    districtMembers: DistrictMember[];
};

export function HunterManagementUsingState(props: HunterManagementUsingStateProps) {
    const { t } = useTranslation();
    const { confirm } = useConfirmationDialog();
    const permissions = usePermissions();
    const hasPermissionToManageHunt = permissions.manageDrivenHunt(props.huntManagerPersonId);

    const [isMenuVisible, setIsMenuVisible] = React.useState(false);
    const [isListVisible, setIsListVisible] = React.useState(false);
    const [isScannerVisible, setIsScannerVisible] = React.useState(false);
    const [isFormVisible, setIsFormVisible] = React.useState(false);

    function onAddHunters(districtMembers: DistrictMember[]) {
        const hunters = districtMembers.map((districtMember) => {
            const hunter: Hunter = {
                guid: randomUUID(),
                personId: districtMember.personId,
                fullName: districtMember.fullName,
                huntersCardNumber: districtMember.huntersCardNumber,
                statusId: HuntEventStatus.Scheduled,
            };
            return hunter;
        });
        props.onHuntersChange(props.hunters.concat(hunters));
        setIsListVisible(false);
        setIsMenuVisible(false);
    }

    function onAddHunter(personId: number, fullName: string, huntersCardNumber: string) {
        props.onHuntersChange(
            props.hunters.concat({
                guid: randomUUID(),
                personId,
                fullName,
                huntersCardNumber,
                statusId: HuntEventStatus.Scheduled,
            })
        );
    }

    async function onRemoveHunter(guid: string, hunter: string) {
        const confirmed = await confirm({
            title: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.title", {
                hunter,
            }),
            confirmButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.confirm"),
            rejectButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.reject"),
        });
        if (confirmed) {
            props.onHuntersChange(props.hunters.filter((hunter) => hunter.guid !== guid));
        }
    }

    function onAddGuestHunter(fullName: string, guestHuntersCardNumber: string) {
        props.onGuestHuntersChange(
            props.guestHunters.concat({
                fullName,
                guestHuntersCardNumber,
                guid: randomUUID(),
                statusId: HuntEventStatus.Scheduled,
            })
        );
        setIsFormVisible(false);
        setIsMenuVisible(false);
    }

    async function onRemoveGuestHunter(guid: string, hunter: string) {
        const confirmed = await confirm({
            title: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.title", {
                hunter,
            }),
            confirmButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.confirm"),
            rejectButtonTitle: t("hunt.drivenHunt.hunterManagement.pauseConfirmation.reject"),
        });
        if (confirmed) {
            props.onGuestHuntersChange(props.guestHunters.filter((guestHunter) => guestHunter.guid !== guid));
        }
    }

    const hunters = React.useMemo(() => {
        const hunters: Array<{ type: "hunter" | "guestHunter"; guid: string; title: string }> = [];

        for (const hunter of props.hunters) {
            hunters.push({
                type: "hunter",
                guid: hunter.guid,
                title: hasPermissionToManageHunt ? hunter.fullName + " " + hunter.huntersCardNumber : hunter.fullName,
            });
        }

        for (const guestHunter of props.guestHunters) {
            hunters.push({
                type: "guestHunter",
                guid: guestHunter.guid,
                title: hasPermissionToManageHunt
                    ? guestHunter.fullName + " " + guestHunter.guestHuntersCardNumber
                    : guestHunter.fullName,
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
                                <Text style={styles.listItemTitle}>{hunter.title}</Text>
                                <IconButton
                                    name="trash"
                                    color="gray5"
                                    onPress={() => {
                                        if (hunter.type === "hunter") {
                                            onRemoveHunter(hunter.guid, hunter.title);
                                        } else {
                                            onRemoveGuestHunter(hunter.guid, hunter.title);
                                        }
                                    }}
                                />
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
