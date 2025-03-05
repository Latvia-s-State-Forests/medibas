import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useInterpret } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, createMachine } from "xstate";
import { UpdateMemberRolesBody as UpdateMemberBody, api } from "~/api";
import { Button } from "~/components/button";
import { Checkbox } from "~/components/checkbox-button";
import { Dialog } from "~/components/dialog";
import { Header } from "~/components/header";
import { MediumIcon } from "~/components/icon";
import { PressableListItem } from "~/components/list/pressable-list-item";
import { Spinner } from "~/components/spinner";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { MemberRole } from "~/types/mtl";
import { RootNavigatorParams } from "~/types/navigation";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";
import { formatMemberLabel } from "./format-member-label";

type MemberRolesScreenProps = NativeStackScreenProps<RootNavigatorParams, "MemberRolesScreen">;

export function MemberRolesScreen(props: MemberRolesScreenProps) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const service = useInterpret(() => updateMemberRolesMachine);

    const { member, districtId, mode } = props.route.params;

    let isTrustee = false;
    let isAdministrator = false;
    let isManager = false;
    let isHunter = false;

    for (const role of member.roles) {
        if (role === MemberRole.Trustee) {
            isTrustee = true;
        } else if (role === MemberRole.Administrator) {
            isAdministrator = true;
        } else if (role === MemberRole.Manager) {
            isManager = true;
        } else if (role === MemberRole.Hunter) {
            isHunter = true;
        }
    }

    const [isAdministratorRoleChecked, setIsAdministratorRoleChecked] = React.useState(isAdministrator);

    function onToggleAdministratorRole() {
        setIsAdministratorRoleChecked((checked) => !checked);
    }

    async function onSubmit() {
        const add: MemberRole[] = [];
        const remove: MemberRole[] = [];

        if (isAdministratorRoleChecked) {
            add.push(MemberRole.Administrator);
        } else {
            remove.push(MemberRole.Administrator);
        }

        const payload: UpdateMemberBody = {
            cardNumber: member.cardNumber ?? "MISSING_CARD_NUMBER", // TODO: Remove default value once the API is fixed
            districts: [districtId],
            add,
            remove,
        };

        service.send({ type: "UPDATE_ROLES", payload });
    }

    return (
        <View style={styles.container}>
            <Header title={formatMemberLabel(member.cardNumber, member.firstName, member.lastName)} />
            <View
                style={[
                    {
                        paddingRight: insets.right + 16,
                        paddingLeft: insets.left + 16,
                        paddingBottom: insets.bottom + 24,
                    },
                    styles.content,
                ]}
            >
                <View>
                    <PressableListItem
                        label={t("mtl.memberRoles.trustee")}
                        leftContent={<MediumIcon name="houseSlim" />}
                        rightContent={<Checkbox state={isTrustee ? "checked" : "unchecked"} disabled />}
                        fullWidth={false}
                        onPress={() => {}}
                        disabled
                    />
                    <PressableListItem
                        label={t("mtl.memberRoles.administrator")}
                        leftContent={<MediumIcon name="key" />}
                        rightContent={
                            <Checkbox
                                state={isAdministratorRoleChecked ? "checked" : "unchecked"}
                                disabled={mode === "view"}
                            />
                        }
                        fullWidth={false}
                        onPress={onToggleAdministratorRole}
                        disabled={mode === "view"}
                    />
                    <PressableListItem
                        label={t("mtl.memberRoles.manager")}
                        leftContent={<MediumIcon name="flag" />}
                        rightContent={<Checkbox state={isManager ? "checked" : "unchecked"} disabled />}
                        fullWidth={false}
                        onPress={() => {}}
                        disabled
                    />
                    <PressableListItem
                        label={t("mtl.memberRoles.hunter")}
                        leftContent={<MediumIcon name="huntTarget" />}
                        rightContent={<Checkbox state={isHunter ? "checked" : "unchecked"} disabled />}
                        fullWidth={false}
                        onPress={() => {}}
                        disabled
                    />
                </View>

                {mode === "edit" ? (
                    <Button
                        onPress={onSubmit}
                        variant="primary"
                        title={t("mtl.save")}
                        disabled={isAdministratorRoleChecked === isAdministrator}
                    />
                ) : null}
            </View>

            <UpdateMemberRolesStatusDialog service={service} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.background,
    },
    content: {
        flex: 1,
        justifyContent: "space-between",
    },
});

const updateMemberRolesMachine = createMachine(
    {
        id: "updateMemberRoles",
        schema: {
            events: {} as
                | { type: "UPDATE_ROLES"; payload: UpdateMemberBody }
                | { type: "UPDATE_ROLES_SUCCESS" }
                | { type: "UPDATE_ROLES_FAILURE" }
                | { type: "UPDATE_MEMBERSHIPS_SUCCESS" }
                | { type: "UPDATE_MEMBERSHIPS_FAILURE" }
                | { type: "RESET" }
                | NetworkStatusEvent,
            context: {} as { payload?: UpdateMemberBody },
        },
        initial: "idle",
        states: {
            idle: {
                on: {
                    UPDATE_ROLES: { target: "verifyingNetworkConnection", actions: ["setPayload"] },
                },
            },

            verifyingNetworkConnection: {
                invoke: { src: networkStatusMachine },
                on: {
                    NETWORK_AVAILABLE: { target: "updatingMemberRoles" },
                    NETWORK_UNAVAILABLE: { target: "networkFailure" },
                },
            },

            updatingMemberRoles: {
                invoke: { src: "updateMemberRoles" },
                on: {
                    UPDATE_ROLES_SUCCESS: { target: "updatingMemberships" },
                    UPDATE_ROLES_FAILURE: { target: "otherFailure" },
                },
            },

            updatingMemberships: {
                invoke: { src: "updateMemberships" },
                on: {
                    UPDATE_MEMBERSHIPS_SUCCESS: { target: "success" },
                    UPDATE_MEMBERSHIPS_FAILURE: { target: "otherFailure" },
                },
            },

            success: {
                type: "final",
            },

            networkFailure: {
                on: {
                    RESET: { target: "idle", actions: ["resetPayload"] },
                },
            },

            otherFailure: {
                on: {
                    RESET: { target: "idle", actions: ["resetPayload"] },
                },
            },
        },
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        actions: {
            setPayload: assign({
                payload: (context, event) => {
                    if (event.type !== "UPDATE_ROLES") {
                        return context.payload;
                    }
                    return event.payload;
                },
            }),
            resetPayload: assign({
                payload: undefined,
            }),
        },
        services: {
            updateMemberRoles: (context) => async (send) => {
                if (!context.payload) {
                    logger.error("Failed to update member roles, payload is missing");
                    send({ type: "UPDATE_ROLES_FAILURE" });
                    return;
                }

                try {
                    await api.updateMemberRoles(context.payload);
                    send({ type: "UPDATE_ROLES_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to update member roles", error);
                    send({ type: "UPDATE_ROLES_FAILURE" });
                }
            },
            updateMemberships: () => async (send) => {
                try {
                    await queryClient.refetchQueries(queryKeys.memberships, undefined, { throwOnError: true });
                    send({ type: "UPDATE_MEMBERSHIPS_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to update memberships", error);
                    send({ type: "UPDATE_MEMBERSHIPS_FAILURE" });
                }
            },
        },
    }
);

type UpdateMemberRolesStatusDialogProps = {
    service: ActorRefFrom<typeof updateMemberRolesMachine>;
};

function UpdateMemberRolesStatusDialog({ service }: UpdateMemberRolesStatusDialogProps) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<"loading" | "success" | "networkFailure" | "otherFailure">("loading");

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "UMR " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            if (
                state.matches("verifyingNetworkConnection") ||
                state.matches("registeringMember") ||
                state.matches("updatingMemberships")
            ) {
                setVisible(true);
                setStatus("loading");
            } else if (state.matches("success")) {
                setVisible(true);
                setStatus("success");
            } else if (state.matches("networkFailure")) {
                setVisible(true);
                setStatus("networkFailure");
            } else if (state.matches("otherFailure")) {
                setVisible(true);
                setStatus("otherFailure");
            } else {
                setVisible(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [service]);

    return match(status)
        .with("loading", () => (
            <Dialog visible={visible} icon={<Spinner />} title={t("mtl.memberRoles.loading.title")} />
        ))
        .with("success", () => (
            <Dialog
                visible={visible}
                icon="success"
                title={t("mtl.memberRoles.success.title")}
                buttons={<Button title={t("mtl.memberRoles.success.continue")} onPress={() => navigation.goBack()} />}
            />
        ))
        .with("networkFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("mtl.memberRoles.networkFailure.title")}
                description={t("mtl.memberRoles.networkFailure.description")}
                buttons={
                    <Button title={t("mtl.memberRoles.networkFailure.close")} onPress={() => service.send("RESET")} />
                }
            />
        ))
        .with("otherFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("mtl.memberRoles.otherFailure.title")}
                buttons={
                    <Button title={t("mtl.memberRoles.otherFailure.close")} onPress={() => service.send("RESET")} />
                }
            />
        ))
        .exhaustive();
}
