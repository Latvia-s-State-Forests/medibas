import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TextInput, View } from "react-native";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, createMachine } from "xstate";
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

export const approveOrRejectIndividualHuntMachine = createMachine(
    {
        id: "approveOrRejectIndividualHunt",
        schema: {
            events: {} as
                | { type: "SUBMIT"; payload: ApproveOrRejectIndividualHunt }
                | { type: "SUBMIT_SUCCESS" }
                | { type: "SUBMIT_FAILURE" }
                | { type: "UPDATE_SUCCESS" }
                | { type: "UPDATE_FAILURE" }
                | { type: "RESET" }
                | { type: "UPDATE" }
                | NetworkStatusEvent,
            context: {} as { payload?: ApproveOrRejectIndividualHunt },
        },
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
                invoke: { src: "approveOrRejectIndividualHunt" },
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
                invoke: { src: "updateHunt" },
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
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        actions: {
            setPayload: assign({
                payload: (context, event) => {
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
        services: {
            approveOrRejectIndividualHunt: (context) => async (send) => {
                if (!context.payload) {
                    logger.error("Failed to add driven hunt, payload is missing");
                    send({ type: "SUBMIT_FAILURE" });
                    return;
                }
                try {
                    await api.approveOrRejectIndividualHunt(context.payload);
                    send({ type: "SUBMIT_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to add driven hunt", error);
                    send({ type: "SUBMIT_FAILURE" });
                }
            },
            updateHunt: (context) => async (send) => {
                try {
                    const existingHuntData = queryClient.getQueryData(queryKeys.hunts) as Hunt[] | undefined;

                    if (existingHuntData && context.payload) {
                        const updatedData = existingHuntData.map((hunt) => {
                            if (hunt.id === context.payload?.id) {
                                return {
                                    ...hunt,
                                    isIndividualHuntApproved: context.payload?.isApproved,
                                    reasonForRejection: context.payload?.reasonForRejection,
                                };
                            }
                            return hunt;
                        });

                        queryClient.setQueryData(queryKeys.hunts, updatedData);
                    } else {
                        await queryClient.refetchQueries(queryKeys.hunts, undefined, { throwOnError: true });
                    }

                    send({ type: "UPDATE_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to refetch hunts", error);
                    send({ type: "UPDATE_FAILURE" });
                }
            },
        },
    }
);
type ApproveRejectStatusDialogProps = {
    huntId: number;
    isRejection: boolean;
    onCancelRejection(): void;
    service: ActorRefFrom<typeof approveOrRejectIndividualHuntMachine>;
};

export function ApproveRejectStatusDialog({
    huntId,
    service,
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
            service.send({
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
        service.send("RESET");
        setValueMultiline("");
        setStatus("idle");
    }

    React.useEffect(() => {
        if (isRejection) {
            setStatus("reject");
        }
    }, [isRejection]);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "REJECT HUNT " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
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
    }, [service]);

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
                            service.send({ type: "UPDATE" });
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
                buttons={<Button title={t("networkFailure.close")} onPress={() => service.send("RESET")} />}
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
                buttons={<Button title={t("networkFailure.close")} onPress={() => service.send("RESET")} />}
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
