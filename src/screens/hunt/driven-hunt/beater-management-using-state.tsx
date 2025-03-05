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
import { Beater, DistrictMember, GuestBeater, Hunter, HuntEventStatus } from "~/types/hunts";
import { BeaterFormModal } from "./beater-form-modal";
import { BeaterMenuModal } from "./beater-menu-modal";
import { BeaterScannerModal } from "./beater-scanner-modal";
import { useMemberOptions } from "./use-member-options";

type BeaterManagementUsingStateProps = {
    districtIds: number[];
    huntManagerPersonId: number | undefined;
    beaters: Beater[];
    onBeatersChange: (beaters: Beater[]) => void;
    guestBeaters: GuestBeater[];
    onGuestBeatersChange: (guestBeaters: GuestBeater[]) => void;
    hunters: Hunter[];
    districtMembers: DistrictMember[];
};

export function BeaterManagementUsingState(props: BeaterManagementUsingStateProps) {
    const { t } = useTranslation();
    const { confirm } = useConfirmationDialog();
    const permissions = usePermissions();
    const hasPermissionToManageHunt = permissions.manageDrivenHunt(props.huntManagerPersonId);

    const [isMenuVisible, setIsMenuVisible] = React.useState(false);
    const [isListVisible, setIsListVisible] = React.useState(false);
    const [isScannerVisible, setIsScannerVisible] = React.useState(false);
    const [isFormVisible, setIsFormVisible] = React.useState(false);

    function onAddBeaters(districtMembers: DistrictMember[]) {
        const beaters = districtMembers.map((districtMember) => {
            const beater: Beater = {
                guid: randomUUID(),
                userId: districtMember.userId,
                hunterPersonId: districtMember.personId,
                fullName: districtMember.fullName,
                statusId: HuntEventStatus.Scheduled,
            };
            return beater;
        });
        props.onBeatersChange(props.beaters.concat(beaters));
        setIsListVisible(false);
        setIsMenuVisible(false);
    }

    function onAddBeater(userId: number, fullName: string, hunterPersonId?: number) {
        props.onBeatersChange(
            props.beaters.concat({
                guid: randomUUID(),
                userId,
                fullName,
                hunterPersonId,
                statusId: HuntEventStatus.Scheduled,
            })
        );
    }

    async function onRemoveBeater(guid: string, beater: string) {
        const confirmed = await confirm({
            title: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.title", {
                beater,
            }),
            confirmButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.confirm"),
            rejectButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.reject"),
        });
        if (confirmed) {
            props.onBeatersChange(props.beaters.filter((beater) => beater.guid !== guid));
        }
    }

    function onAddGuestBeater(fullName: string) {
        props.onGuestBeatersChange(
            props.guestBeaters.concat({
                fullName,
                guid: randomUUID(),
                statusId: HuntEventStatus.Scheduled,
            })
        );
        setIsFormVisible(false);
        setIsMenuVisible(false);
    }

    async function onRemoveGuestBeater(guid: string, beater: string) {
        const confirmed = await confirm({
            title: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.title", {
                beater,
            }),
            confirmButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.confirm"),
            rejectButtonTitle: t("hunt.drivenHunt.beaterManagement.pauseConfirmation.reject"),
        });
        if (confirmed) {
            props.onGuestBeatersChange(props.guestBeaters.filter((guestBeater) => guestBeater.guid !== guid));
        }
    }

    const beaters = React.useMemo(() => {
        const beaters: Array<{ type: "beater" | "guestBeater"; guid: string; title: string }> = [];

        for (const beater of props.beaters) {
            beaters.push({
                type: "beater",
                guid: beater.guid,
                title: beater.fullName,
            });
        }

        for (const guestBeater of props.guestBeaters) {
            beaters.push({
                type: "guestBeater",
                guid: guestBeater.guid,
                title: guestBeater.fullName,
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
                                <Text style={styles.listItemTitle}>{beater.title}</Text>
                                <IconButton
                                    name="trash"
                                    color="gray5"
                                    onPress={() => {
                                        if (beater.type === "beater") {
                                            onRemoveBeater(beater.guid, beater.title);
                                        } else {
                                            onRemoveGuestBeater(beater.guid, beater.title);
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
