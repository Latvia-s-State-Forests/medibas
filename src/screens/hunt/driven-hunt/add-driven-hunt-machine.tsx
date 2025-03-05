import { useNavigation } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { ActorRefFrom, assign, createMachine } from "xstate";
import { DrivenHuntBody, api } from "~/api";
import { Button } from "~/components/button";
import { Dialog } from "~/components/dialog";
import { Spinner } from "~/components/spinner";
import { useClassifiers } from "~/hooks/use-classifiers";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { getErrorMessageFromApi } from "~/utils/error-message-from-api";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";

export const addDrivenHuntMachine = createMachine(
    {
        id: "addHunt",
        schema: {
            events: {} as
                | { type: "SUBMIT"; payload: DrivenHuntBody }
                | { type: "SUBMIT_SUCCESS" }
                | { type: "SUBMIT_FAILURE"; errorCode?: number }
                | { type: "UPDATE_SUCCESS" }
                | { type: "UPDATE_FAILURE" }
                | { type: "RESET" }
                | NetworkStatusEvent,
            context: {} as { payload?: DrivenHuntBody; errorCode?: number },
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
                    NETWORK_AVAILABLE: { target: "sendHunt" },
                    NETWORK_UNAVAILABLE: { target: "networkFailure" },
                },
            },

            sendHunt: {
                invoke: { src: "addHunt" },
                on: {
                    SUBMIT_SUCCESS: { target: "updatingHunt" },
                    SUBMIT_FAILURE: [{ target: "otherFailure", actions: ["setErrorCode"] }],
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
            setErrorCode: assign({
                errorCode: (context, event) => {
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
        services: {
            addHunt: (context) => async (send) => {
                if (!context.payload) {
                    logger.error("Failed to add driven hunt, payload is missing");
                    send({ type: "SUBMIT_FAILURE" });
                    return;
                }
                try {
                    const result = await api.addDrivenHunt(context.payload);
                    if (result.success) {
                        send({ type: "SUBMIT_SUCCESS" });
                    } else {
                        logger.error("Failed to add driven hunt with error code", result.errorCode);
                        send({ type: "SUBMIT_FAILURE", errorCode: result.errorCode });
                    }
                } catch (error) {
                    logger.error("Failed to add driven hunt", error);
                    send({ type: "SUBMIT_FAILURE" });
                }
            },
            updateHunt: () => async (send) => {
                try {
                    await queryClient.refetchQueries(queryKeys.hunts, undefined, { throwOnError: true });
                    console.log("queryKeys.hunts", queryKeys.hunts);
                    send({ type: "UPDATE_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to update memberships", error);
                    send({ type: "UPDATE_FAILURE" });
                }
            },
        },
    }
);

type AddDrivenHuntStatusDialogProps = {
    service: ActorRefFrom<typeof addDrivenHuntMachine>;
    editing?: boolean;
};

export function AddDrivenHuntStatusDialog({ service, editing }: AddDrivenHuntStatusDialogProps) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const classifiers = useClassifiers();
    const errorCode = useSelector(service, (state) => state.context.errorCode);
    const errorMessage = getErrorMessageFromApi(errorCode, classifiers);
    const [visible, setVisible] = React.useState(false);
    const [status, setStatus] = React.useState<"loading" | "success" | "networkFailure" | "otherFailure">("loading");

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "ADH " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
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
    }, [service]);

    return match(status)
        .with("loading", () => (
            <Dialog visible={visible} icon={<Spinner />} title={t("hunt.drivenHunt.sendHunt.loading")} />
        ))
        .with("success", () => (
            <Dialog
                visible={visible}
                icon="success"
                title={editing ? t("hunt.drivenHunt.editHunt.success") : t("hunt.drivenHunt.sendHunt.success")}
                buttons={
                    <Button
                        title={t("mtl.registerMember.success.continue")}
                        onPress={() => navigation.navigate("DrivenHuntListScreen")}
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
                title={editing ? t("hunt.drivenHunt.editHunt.failure") : t("hunt.drivenHunt.sendHunt.failure")}
                description={errorMessage ?? t("hunt.drivenHunt.sendHunt.failureDescription")}
                buttons={<Button title={t("networkFailure.close")} onPress={() => service.send("RESET")} />}
            />
        ))
        .exhaustive();
}
