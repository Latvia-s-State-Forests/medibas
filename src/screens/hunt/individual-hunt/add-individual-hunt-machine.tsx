import { useNavigation } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, fromCallback, setup } from "xstate";
import { IndividualHuntBody, api } from "~/api";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Spinner } from "~/components/spinner";
import { useClassifiers } from "~/hooks/use-classifiers";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { getErrorMessageFromApi } from "~/utils/error-message-from-api";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";

type AddIndividualHuntEvent =
    | { type: "SUBMIT"; payload: IndividualHuntBody }
    | { type: "SUBMIT_SUCCESS" }
    | { type: "SUBMIT_FAILURE"; errorCode?: number }
    | { type: "UPDATE_SUCCESS" }
    | { type: "UPDATE_FAILURE" }
    | { type: "RESET" }
    | NetworkStatusEvent;

export const addIndividualHuntMachine = setup({
    types: {
        events: {} as AddIndividualHuntEvent,
        context: {} as { payload?: IndividualHuntBody; errorCode?: number },
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
        setErrorCode: assign({
            errorCode: ({ context, event }) => {
                if (event.type !== "SUBMIT_FAILURE") {
                    return context.errorCode;
                }
                return event.errorCode;
            },
        }),
        resetPayload: assign({
            payload: undefined,
        }),
    },
    actors: {
        addHunt: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: AddIndividualHuntEvent) => void;
                input: { payload?: IndividualHuntBody };
            }) => {
                if (!input.payload) {
                    logger.error("Failed to add individual hunt, payload is missing");
                    sendBack({ type: "SUBMIT_FAILURE" });
                    return;
                }
                api.addIndividualHunt(input.payload)
                    .then((result) => {
                        if (result.success) {
                            sendBack({ type: "SUBMIT_SUCCESS" });
                        } else {
                            logger.error("Failed to add individual hunt with error code", result.errorCode);
                            sendBack({ type: "SUBMIT_FAILURE", errorCode: result.errorCode });
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to add individual hunt", error);
                        sendBack({ type: "SUBMIT_FAILURE" });
                    });
            }
        ),
        updateHunt: fromCallback(({ sendBack }: { sendBack: (event: AddIndividualHuntEvent) => void }) => {
            queryClient
                .refetchQueries({ queryKey: queryKeys.hunts }, { throwOnError: true })
                .then(() => {
                    console.log("queryKeys.hunts", queryKeys.hunts);
                    sendBack({ type: "UPDATE_SUCCESS" });
                })
                .catch((error) => {
                    logger.error("Failed to update memberships", error);
                    sendBack({ type: "UPDATE_FAILURE" });
                });
        }),
    },
}).createMachine({
    id: "addHunt",
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
                NETWORK_AVAILABLE: { target: "sendHunt" },
                NETWORK_UNAVAILABLE: { target: "networkFailure" },
            },
        },

        sendHunt: {
            invoke: {
                src: "addHunt",
                input: ({ context }) => ({ payload: context.payload }),
            },
            on: {
                SUBMIT_SUCCESS: { target: "updatingHunt" },
                SUBMIT_FAILURE: { target: "otherFailure", actions: ["setErrorCode"] },
            },
        },

        updatingHunt: {
            invoke: { src: "updateHunt" },
            on: {
                UPDATE_SUCCESS: { target: "success" },
                UPDATE_FAILURE: { target: "otherFailure" },
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
});

type AddIndividualHuntStatusDialogProps = {
    isEditing?: boolean;
    actor: ActorRefFrom<typeof addIndividualHuntMachine>;
};

export function AddIndividualHuntStatusDialog({ actor, isEditing }: AddIndividualHuntStatusDialogProps) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const classifiers = useClassifiers();
    const errorCode = useSelector(actor, (state) => state.context.errorCode);
    const errorMessage = getErrorMessageFromApi(errorCode, classifiers);
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<"loading" | "success" | "networkFailure" | "otherFailure">("loading");

    React.useEffect(() => {
        const subscription = actor.subscribe((state) => {
            if (
                state.matches("verifyingNetworkConnection") ||
                state.matches("sendHunt") ||
                state.matches("updatingHunt")
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
        .with("loading", () => (
            <Dialog visible={visible} icon={<Spinner />} title={t("hunt.individualHunt.sendHunt.loading")} />
        ))
        .with("success", () => (
            <Dialog
                visible={visible}
                icon="success"
                title={
                    isEditing ? t("hunt.individualHunt.editHunt.success") : t("hunt.individualHunt.sendHunt.success")
                }
                buttons={
                    <Button title={t("mtl.registerMember.success.continue")} onPress={() => navigation.goBack()} />
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
                    isEditing ? t("hunt.individualHunt.editHunt.failure") : t("hunt.individualHunt.sendHunt.failure")
                }
                description={errorMessage ?? t("hunt.individualHunt.sendHunt.failureDescription")}
                buttons={<Button title={t("networkFailure.close")} onPress={() => actor.send({ type: "RESET" })} />}
            />
        ))
        .exhaustive();
}
