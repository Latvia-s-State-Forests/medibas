import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, fromCallback, setup } from "xstate";
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
    actor: ActorRefFrom<typeof deleteMemberMachine>;
};

export function DeleteMemberStatusDialog({ actor }: DeleteMemberStatusDialogProps) {
    const { t } = useTranslation();
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<
        "confirming" | "loading" | "success" | "networkFailure" | "otherFailure"
    >("loading");

    React.useEffect(() => {
        const subscription = actor.subscribe((state) => {
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
    }, [actor]);

    return match(status)
        .with("confirming", () => {
            const context = actor.getSnapshot()?.context;
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
                                onPress={() => actor.send({ type: "CONFIRM" })}
                            />
                            <Button
                                variant="secondary-outlined"
                                title={t("mtl.deleteMember.confirming.cancel")}
                                onPress={() => actor.send({ type: "CANCEL" })}
                            />
                        </>
                    }
                    onBackButtonPress={() => actor.send({ type: "CANCEL" })}
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
                    <Button
                        title={t("mtl.deleteMember.success.continue")}
                        onPress={() => actor.send({ type: "RESET" })}
                    />
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
                            onPress={() => actor.send({ type: "RETRY" })}
                        />
                        <Button
                            variant="secondary-outlined"
                            title={t("mtl.deleteMember.networkFailure.cancel")}
                            onPress={() => actor.send({ type: "CANCEL" })}
                        />
                    </>
                }
                onBackButtonPress={() => actor.send({ type: "CANCEL" })}
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
                            onPress={() => actor.send({ type: "RETRY" })}
                        />
                        <Button
                            variant="secondary-outlined"
                            title={t("mtl.deleteMember.otherFailure.cancel")}
                            onPress={() => actor.send({ type: "CANCEL" })}
                        />
                    </>
                }
                onBackButtonPress={() => actor.send({ type: "CANCEL" })}
            />
        ))
        .exhaustive();
}

type DeleteMemberEvent =
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
    | NetworkStatusEvent;

export const deleteMemberMachine = setup({
    types: {
        events: {} as DeleteMemberEvent,
        context: {} as { member?: Member; districts?: Array<{ id: number; name: string }> },
    },
    actions: {
        setMemberAndDistricts: assign(({ context, event }) => {
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
    actors: {
        deleteMember: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: DeleteMemberEvent) => void;
                input: { cardNumber: string; districtIds: number[] } | null;
            }) => {
                if (!input) {
                    logger.error("Failed to delete member, member and districts are missing");
                    sendBack({ type: "DELETE_FAILURE" });
                    return;
                }

                api.deleteMembership({ cardNumber: input.cardNumber, removeFromDistrictIds: input.districtIds })
                    .then(() => {
                        sendBack({ type: "DELETE_SUCCESS" });
                    })
                    .catch((error) => {
                        logger.error("Failed to delete member", error);
                        sendBack({ type: "DELETE_FAILURE" });
                    });
            }
        ),
        updateMemberships: fromCallback(({ sendBack }: { sendBack: (event: DeleteMemberEvent) => void }) => {
            queryClient
                .refetchQueries({ queryKey: queryKeys.memberships }, { throwOnError: true })
                .then(() => {
                    sendBack({ type: "UPDATE_MEMBERSHIPS_SUCCESS" });
                })
                .catch((error) => {
                    logger.error("Failed to update memberships", error);
                    sendBack({ type: "UPDATE_MEMBERSHIPS_FAILURE" });
                });
        }),
    },
}).createMachine({
    id: "deleteMember",
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
            invoke: {
                src: "deleteMember",
                input: ({ context }) => {
                    if (context.member?.cardNumber && context.districts) {
                        return {
                            cardNumber: context.member.cardNumber,
                            districtIds: context.districts.map((district) => district.id),
                        };
                    }
                    return null;
                },
            },
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
});
