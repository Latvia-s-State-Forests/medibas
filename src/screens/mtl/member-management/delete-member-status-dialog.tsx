import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, createMachine } from "xstate";
import { api } from "~/api";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Spinner } from "~/components/spinner";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { Member } from "~/types/mtl";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";
import { formatMemberLabel } from "./format-member-label";

type DeleteMemberStatusDialogProps = {
    service: ActorRefFrom<typeof deleteMemberMachine>;
};

export function DeleteMemberStatusDialog({ service }: DeleteMemberStatusDialogProps) {
    const { t } = useTranslation();
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<
        "confirming" | "loading" | "success" | "networkFailure" | "otherFailure"
    >("loading");

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "DM " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            if (state.matches("confirmingDeleteFromSingleDistrict")) {
                setVisible(true);
                setStatus("confirming");
            } else if (
                state.matches("verifyingNetworkConnection") ||
                state.matches("deletingMember") ||
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
        .with("confirming", () => {
            const context = service.getSnapshot()?.context;
            const member = context?.member
                ? formatMemberLabel(context.member.cardNumber, context.member.firstName, context.member.lastName)
                : "";
            const district = context?.districts ? context.districts[0].name : undefined;
            return (
                <Dialog
                    visible={visible}
                    icon="delete"
                    title={t("mtl.deleteMember.confirming.title", { member, district })}
                    buttons={
                        <>
                            <Button
                                variant="danger"
                                title={t("mtl.deleteMember.confirming.delete")}
                                onPress={() => service.send("CONFIRM")}
                            />
                            <Button
                                variant="secondary-outlined"
                                title={t("mtl.deleteMember.confirming.cancel")}
                                onPress={() => service.send("CANCEL")}
                            />
                        </>
                    }
                    onBackButtonPress={() => service.send("CANCEL")}
                />
            );
        })
        .with("loading", () => (
            <Dialog visible={visible} icon={<Spinner />} title={t("mtl.deleteMember.loading.title")} />
        ))
        .with("success", () => (
            <Dialog
                visible={visible}
                icon="success"
                title={t("mtl.deleteMember.success.title")}
                buttons={
                    <Button title={t("mtl.deleteMember.success.continue")} onPress={() => service.send("RESET")} />
                }
            />
        ))
        .with("networkFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("mtl.deleteMember.networkFailure.title")}
                description={t("mtl.deleteMember.networkFailure.description")}
                buttons={
                    <>
                        <Button
                            title={t("mtl.deleteMember.networkFailure.retry")}
                            onPress={() => service.send("RETRY")}
                        />
                        <Button
                            variant="secondary-outlined"
                            title={t("mtl.deleteMember.networkFailure.cancel")}
                            onPress={() => service.send("CANCEL")}
                        />
                    </>
                }
                onBackButtonPress={() => service.send("CANCEL")}
            />
        ))
        .with("otherFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("mtl.deleteMember.otherFailure.title")}
                buttons={
                    <>
                        <Button
                            title={t("mtl.deleteMember.otherFailure.retry")}
                            onPress={() => service.send("RETRY")}
                        />
                        <Button
                            variant="secondary-outlined"
                            title={t("mtl.deleteMember.otherFailure.cancel")}
                            onPress={() => service.send("CANCEL")}
                        />
                    </>
                }
                onBackButtonPress={() => service.send("CANCEL")}
            />
        ))
        .exhaustive();
}

export const deleteMemberMachine = createMachine(
    {
        id: "deleteMember",
        schema: {
            events: {} as
                | { type: "DELETE_FROM_SINGLE_DISTRICT"; member: Member; district: { id: number; name: string } }
                | {
                      type: "DELETE_FROM_MULTIPLE_DISTRICTS";
                      member: Member;
                      districts: Array<{ id: number; name: string }>;
                  }
                | { type: "DELETE_SUCCESS" }
                | { type: "DELETE_FAILURE" }
                | { type: "UPDATE_MEMBERSHIPS_SUCCESS" }
                | { type: "UPDATE_MEMBERSHIPS_FAILURE" }
                | { type: "CONFIRM" }
                | { type: "RETRY" }
                | { type: "CANCEL" }
                | { type: "RESET" }
                | NetworkStatusEvent,
            context: {} as { member?: Member; districts?: Array<{ id: number; name: string }> },
        },
        initial: "idle",
        states: {
            idle: {
                on: {
                    DELETE_FROM_SINGLE_DISTRICT: {
                        target: "confirmingDeleteFromSingleDistrict",
                        actions: ["setMemberAndDistricts"],
                    },
                    DELETE_FROM_MULTIPLE_DISTRICTS: {
                        target: "verifyingNetworkConnection",
                        actions: ["setMemberAndDistricts"],
                    },
                },
            },

            confirmingDeleteFromSingleDistrict: {
                on: {
                    CONFIRM: { target: "verifyingNetworkConnection" },
                    CANCEL: { target: "idle", actions: ["resetMemberAndDistricts"] },
                },
            },

            verifyingNetworkConnection: {
                invoke: { src: networkStatusMachine },
                on: {
                    NETWORK_AVAILABLE: { target: "deletingMember" },
                    NETWORK_UNAVAILABLE: { target: "networkFailure" },
                },
            },

            deletingMember: {
                invoke: { src: "deleteMember" },
                on: {
                    DELETE_SUCCESS: { target: "updatingMemberships" },
                    DELETE_FAILURE: { target: "otherFailure" },
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
                on: {
                    RESET: { target: "idle", actions: ["resetMemberAndDistricts", "onDeleteSuccess"] },
                },
            },

            networkFailure: {
                on: {
                    RETRY: { target: "verifyingNetworkConnection" },
                    CANCEL: { target: "idle", actions: ["resetMemberAndDistricts"] },
                },
            },

            otherFailure: {
                on: {
                    RETRY: { target: "verifyingNetworkConnection" },
                    CANCEL: { target: "idle", actions: ["resetMemberAndDistricts"] },
                },
            },
        },
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        actions: {
            setMemberAndDistricts: assign((context, event) => {
                if (event.type === "DELETE_FROM_SINGLE_DISTRICT") {
                    return {
                        member: event.member,
                        districts: [event.district],
                    };
                }

                if (event.type === "DELETE_FROM_MULTIPLE_DISTRICTS") {
                    return {
                        member: event.member,
                        districts: event.districts,
                    };
                }

                return context;
            }),
            resetMemberAndDistricts: assign({
                member: undefined,
                districts: undefined,
            }),
            onDeleteSuccess: () => {
                // This should be overridden when necessary
            },
        },
        services: {
            deleteMember: (context) => async (send) => {
                if (!context.member?.cardNumber || !context.districts) {
                    logger.error("Failed to delete member, member and districts are missing", context);
                    send({ type: "DELETE_FAILURE" });
                    return;
                }

                try {
                    await api.deleteMembership({
                        cardNumber: context.member.cardNumber,
                        removeFromDistrictIds: context.districts.map((d) => d.id),
                    });
                    send({ type: "DELETE_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to delete member", error);
                    send({ type: "DELETE_FAILURE" });
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
