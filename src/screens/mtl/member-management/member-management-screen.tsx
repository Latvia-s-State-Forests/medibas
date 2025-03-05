import { useNavigation } from "@react-navigation/native";
import { useInterpret } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "~/components/button";
import { Collapsible } from "~/components/collapsible/collapsible";
import { Header } from "~/components/header";
import { MediumIcon, MediumIconName } from "~/components/icon";
import { IconButton } from "~/components/icon-button";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { configuration } from "~/configuration";
import { useMemberships } from "~/hooks/use-memberships";
import { usePermissions } from "~/hooks/use-permissions";
import { useProfile } from "~/hooks/use-profile";
import { theme } from "~/theme";
import { Member, MemberRole } from "~/types/mtl";
import { DeleteMemberStatusDialog, deleteMemberMachine } from "./delete-member-status-dialog";
import { formatMemberLabel } from "./format-member-label";

export function MemberManagementScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { t } = useTranslation();
    const memberships = useMemberships();
    const profile = useProfile();
    const permissions = usePermissions();
    const service = useInterpret(() => deleteMemberMachine);

    function onDeleteModalOpen(member: Member, selectedDistrictId: number) {
        const districts: Array<{ id: number; name: string }> = [];

        for (const membership of memberships) {
            const isMember = membership.members.some((m) => m.cardNumber === member.cardNumber);
            const hasPermissionToDelete = permissions.deleteDistrictMember(membership.id, member.id);
            if (isMember && hasPermissionToDelete) {
                districts.push({ id: membership.id, name: membership.name });
            }
        }

        if (districts.length === 1) {
            service.send({ type: "DELETE_FROM_SINGLE_DISTRICT", member, district: districts[0] });
        } else if (districts.length > 1) {
            navigation.navigate("MemberDeletionModal", {
                member,
                districts,
                preSelectedDistrictId: selectedDistrictId,
            });
        }
    }

    const memberLabel = formatMemberLabel(profile.validHuntersCardNumber, profile.firstName, profile.lastName);

    const districtsWithCreateMemberPermission = memberships.filter((membership) =>
        permissions.createDistrictMember(membership.id)
    );
    const hasPermissionToCreateMembers = districtsWithCreateMemberPermission.length > 0;

    return (
        <View style={styles.container}>
            <Header title={t("mtl.memberManagement")} />
            <ScrollView
                contentContainerStyle={[
                    styles.body,
                    {
                        paddingLeft: insets.left + 16,
                        paddingRight: insets.right + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                ]}
            >
                {hasPermissionToCreateMembers ? (
                    <View style={styles.registerMemberButtonContainer}>
                        <Button
                            onPress={() => navigation.navigate("MemberRegistrationScreen")}
                            variant="secondary-dark"
                            title={t("mtl.registerMember.title")}
                            icon="plus"
                            style={styles.registerMemberButton}
                        />
                    </View>
                ) : null}
                <PressableListItem
                    label={memberLabel}
                    fullWidth={false}
                    onPress={() => null}
                    leftContent={<MediumIcon name="user" />}
                />

                {memberships.map(({ name, members, id }) => (
                    <Collapsible
                        defaultCollapsed={false}
                        key={id}
                        badgeCount={members.length - 1}
                        title={name}
                        lastInList={true}
                    >
                        {members
                            .filter((member) => member.cardNumber !== profile.validHuntersCardNumber)
                            .map((member, index) => {
                                const { cardNumber, id: memberId, roles, firstName, lastName } = member;
                                const label = formatMemberLabel(cardNumber, firstName, lastName);

                                return (
                                    <PressableListItem
                                        key={memberId}
                                        label={`${index + 1}. ${label}`}
                                        fullWidth={false}
                                        onPress={() =>
                                            navigation.navigate("MemberRolesScreen", {
                                                member,
                                                districtId: id,
                                                mode: permissions.updateDistrictMemberRoles(id, member.id)
                                                    ? "edit"
                                                    : "view",
                                            })
                                        }
                                        disabled={!permissions.viewDistrictMemberRoles(id)}
                                        leftContent={<MemberRoleIcon roles={roles} />}
                                        rightContent={
                                            permissions.deleteDistrictMember(id, memberId) ? (
                                                <IconButton
                                                    style={styles.rightContent}
                                                    color="gray5"
                                                    onPress={() => onDeleteModalOpen(member, id)}
                                                    name="trash"
                                                />
                                            ) : null
                                        }
                                    />
                                );
                            })}
                    </Collapsible>
                ))}
            </ScrollView>

            <DeleteMemberStatusDialog service={service} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    body: {
        paddingBottom: 24,
    },
    rightContent: {
        paddingRight: 0,
    },
    registerMemberButtonContainer: {
        borderBottomWidth: 1,
        borderBottomColor: theme.color.gray2,
    },
    registerMemberButton: {
        paddingVertical: 26,
    },
});

type MemberRoleIconProps = {
    roles: MemberRole[];
};

function MemberRoleIcon(props: MemberRoleIconProps) {
    const highestRole = props.roles.sort((a, b) => {
        if (configuration.mtl.memberRoleSortOrder[a] < configuration.mtl.memberRoleSortOrder[b]) {
            return -1;
        }
        if (configuration.mtl.memberRoleSortOrder[a] > configuration.mtl.memberRoleSortOrder[b]) {
            return 1;
        }
        return 0;
    })[0];
    const name: MediumIconName = configuration.mtl.memberIcons[highestRole] ?? "user";

    return <MediumIcon name={name} />;
}
