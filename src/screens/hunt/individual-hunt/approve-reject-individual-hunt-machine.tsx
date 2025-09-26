import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TextInput, View } from "react-native";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, fromCallback, setup } from "xstate";
import { api } from "~/api";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Modal } from "~/components/modal/modal";
import { Spacer } from "~/components/spacer";
import { Spinner } from "~/components/spinner";
import { Text } from "~/components/text";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { theme } from "~/theme";
import { ApproveOrRejectIndividualHunt, Hunt } from "~/types/hunts";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";

type ApproveOrRejectIndividualHuntEvent =
    | { type: "SUBMIT"; payload: ApproveOrRejectIndividualHunt }
    | { type: "SUBMIT_SUCCESS" }
    | { type: "SUBMIT_FAILURE" }
    | { type: "UPDATE_SUCCESS" }
    | { type: "UPDATE_FAILURE" }
    | { type: "RESET" }
    | { type: "UPDATE" }
    | NetworkStatusEvent;

export const approveOrRejectIndividualHuntMachine = setup({
    types: {
        events: {} as ApproveOrRejectIndividualHuntEvent,
        context: {} as { payload?: ApproveOrRejectIndividualHunt },
    },
    actions: {
        setPayload: assign({
            payload: ({ context, event }) => {
                if (event.type !== "SUBMIT") {
                    return context.payload;
                }
                return event.payload;
            },
        }),
        resetPayload: assign({
            payload: undefined,
        }),
    },
    actors: {
        approveOrRejectIndividualHunt: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: ApproveOrRejectIndividualHuntEvent) => void;
                input: { payload?: ApproveOrRejectIndividualHunt };
            }) => {
                const payload = input?.payload;
                if (!payload) {
                    logger.error("Failed to add driven hunt, payload is missing");
                    sendBack({ type: "SUBMIT_FAILURE" });
                    return;
                }

                api.approveOrRejectIndividualHunt(payload)
                    .then(() => {
                        sendBack({ type: "SUBMIT_SUCCESS" });
                    })
                    .catch((error) => {
                        logger.error("Failed to add driven hunt", error);
                        sendBack({ type: "SUBMIT_FAILURE" });
                    });
            }
        ),
        updateHunt: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: ApproveOrRejectIndividualHuntEvent) => void;
                input: { payload?: ApproveOrRejectIndividualHunt };
            }) => {
                async function update(payload: ApproveOrRejectIndividualHunt | undefined) {
                    const existingHuntData = queryClient.getQueryData(queryKeys.hunts) as Hunt[] | undefined;

                    if (existingHuntData && payload) {
                        const updatedData = existingHuntData.map((hunt) => {
                            if (hunt.id === payload.id) {
                                return {
                                    ...hunt,
                                    isIndividualHuntApproved: payload.isApproved,
                                    reasonForRejection: payload.reasonForRejection,
                                };
                            }
                            return hunt;
                        });

                        queryClient.setQueryData(queryKeys.hunts, updatedData);
                    } else {
                        await queryClient.refetchQueries({ queryKey: queryKeys.hunts }, { throwOnError: true });
                    }
                }

                update(input?.payload)
                    .then(() => {
                        sendBack({ type: "UPDATE_SUCCESS" });
                    })
                    .catch((error) => {
                        logger.error("Failed to refetch hunts", error);
                        sendBack({ type: "UPDATE_FAILURE" });
                    });
            }
        ),
    },
}).createMachine({
    id: "approveOrRejectIndividualHunt",
    initial: "idle",
    states: {
        idle: {
            on: {
                SUBMIT: { target: "verifyingNetworkConnection", actions: ["setPayload"] },
            },
        },

        verifyingNetworkConnection: {
            invoke: { src: networkStatusMachine },
            on: {
                NETWORK_AVAILABLE: { target: "sendHuntApprovalOrRejection" },
                NETWORK_UNAVAILABLE: { target: "networkFailure" },
            },
        },

        sendHuntApprovalOrRejection: {
            invoke: {
                src: "approveOrRejectIndividualHunt",
                input: ({ context }) => ({ payload: context.payload }),
            },
            on: {
                SUBMIT_SUCCESS: { target: "success" },
                SUBMIT_FAILURE: { target: "otherFailure" },
            },
        },

        success: {
            on: {
                UPDATE: { target: "updatingHunt" },
            },
        },

        updatingHunt: {
            invoke: {
                src: "updateHunt",
                input: ({ context }) => ({ payload: context.payload }),
            },
            on: {
                UPDATE_SUCCESS: { target: "idle" },
                UPDATE_FAILURE: { target: "otherFailure" },
            },
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
});

type ApproveRejectStatusDialogProps = {
    huntId: number;
    isRejection: boolean;
    onCancelRejection(): void;
    actor: ActorRefFrom<typeof approveOrRejectIndividualHuntMachine>;
};

export function ApproveRejectStatusDialog({
    huntId,
    actor,
    isRejection,
    onCancelRejection,
}: ApproveRejectStatusDialogProps) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<
        "reject" | "loading" | "success" | "networkFailure" | "otherFailure" | "idle"
    >("idle");
    const [isRejected, setIsRejected] = React.useState(false);
    const [valueMultiline, setValueMultiline] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const active = isFocused || valueMultiline.length > 0;

    function onSubmit() {
        setStatus("idle");
        setIsRejected(true);
        setTimeout(() => {
            actor.send({
                type: "SUBMIT",
                payload: {
                    id: huntId,
                    isApproved: false,
                    ...(isRejection && { reasonForRejection: valueMultiline }),
                },
            });
            onCancelRejection();
        }, 300);
    }

    function onModalClose() {
        onCancelRejection();
        actor.send({ type: "RESET" });
        setValueMultiline("");
        setStatus("idle");
    }

    React.useEffect(() => {
        if (isRejection) {
            setStatus("reject");
        }
    }, [isRejection]);

    React.useEffect(() => {
        const subscription = actor.subscribe((state) => {
            if (state.matches("verifyingNetworkConnection") || state.matches("sendHuntApprovalOrRejection")) {
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
            } else if (state.matches("idle")) {
                setVisible(false);
            } else {
                setVisible(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [actor]);

    return match(status)
        .with("reject", () => (
            <Modal visible={true} onClose={onModalClose}>
                <View style={styles.center}>
                    <Text size={16} weight="bold" style={styles.text}>
                        {t("hunt.individualHunt.reasonForRejection")}
                    </Text>
                    <TextInput
                        multiline={true}
                        numberOfLines={5}
                        value={valueMultiline}
                        onChangeText={setValueMultiline}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={[styles.textArea, active ? styles.focused : {}]}
                    />
                </View>
                <Spacer size={36} />
                <View>
                    <Button
                        title={t("hunt.individualHunt.action.decline")}
                        onPress={onSubmit}
                        disabled={valueMultiline.length === 0}
                    />
                    <Spacer size={16} />
                    <Button onPress={onModalClose} variant="secondary-light" title={t("modal.cancel")} />
                    <Spacer size={18} />
                </View>
            </Modal>
        ))
        .with("loading", () => (
            <Dialog visible={visible} icon={<Spinner />} title={t("hunt.individualHunt.approveOrReject.loading")} />
        ))
        .with("success", () => (
            <Dialog
                visible={visible}
                icon="success"
                title={
                    isRejected
                        ? t("hunt.individualHunt.approveOrReject.successRejection")
                        : t("hunt.individualHunt.approveOrReject.successSeen")
                }
                buttons={
                    <Button
                        title={t("hunt.individualHunt.approveOrReject.continue")}
                        onPress={async () => {
                            navigation.goBack();
                            actor.send({ type: "UPDATE" });
                        }}
                    />
                }
            />
        ))
        .with("networkFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={t("networkFailure.title")}
                description={t("networkFailure.description")}
                buttons={<Button title={t("networkFailure.close")} onPress={() => actor.send({ type: "RESET" })} />}
            />
        ))
        .with("otherFailure", () => (
            <Dialog
                visible={visible}
                icon="failure"
                title={
                    isRejected
                        ? t("hunt.individualHunt.approveOrReject.failureRejection")
                        : t("hunt.individualHunt.approveOrReject.failureApproval")
                }
                description={t("hunt.individualHunt.approveOrReject.failureDescription")}
                buttons={<Button title={t("networkFailure.close")} onPress={() => actor.send({ type: "RESET" })} />}
            />
        ))
        .with("idle", () => null)
        .exhaustive();
}

const styles = StyleSheet.create({
    center: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        lineHeight: 28,
        textAlign: "center",
        marginBottom: 16,
    },
    textArea: {
        height: 120,
        width: "100%",
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        textAlignVertical: "top",
        borderColor: theme.color.gray2,
        backgroundColor: theme.color.white,
    },
    focused: {
        borderColor: theme.color.greenActive,
    },
});
