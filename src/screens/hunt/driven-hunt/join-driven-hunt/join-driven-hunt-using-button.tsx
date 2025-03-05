import NetInfo from "@react-native-community/netinfo";
import { useMachine } from "@xstate/react";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { match, P } from "ts-pattern";
import { assign, createMachine } from "xstate";
import { api } from "~/api";
import { Button } from "~/components/button";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { Hunt, ParticipantRole } from "~/types/hunts";
import { getErrorMessageFromApi } from "~/utils/error-message-from-api";
import { Modal } from "../modal";
import { FailureMessage } from "./failure-message";
import { getHuntTitle } from "./get-hunt-title";
import { HunterConfirmation } from "./hunter-confirmation";
import { LoadingMessage } from "./loading-message";
import { SuccessMessage } from "./success-message";

const joinDrivenHuntUsingButtonMachine = createMachine(
    {
        id: "joinDrivenHuntUsingButton",
        schema: {
            events: {} as
                | { type: "JOIN"; title: string; eventGuid: string }
                | {
                      type: "CONFIRMATION_CONFIRMED";
                      eventGuid: string;
                      participantGuid: string;
                      fullName: string;
                      role: ParticipantRole;
                  }
                | { type: "CONFIRMATION_REJECTED" }
                | { type: "JOIN_SUCCESS" }
                | { type: "JOIN_FAILURE_NETWORK" }
                | { type: "JOIN_FAILURE_CODE"; errorCode: number }
                | { type: "JOIN_FAILURE_OTHER" }
                | { type: "SUCCESS_CONFIRMED" }
                | { type: "FAILURE_CONFIRMED" },
            context: {} as { hunt?: { title: string; eventGuid: string }; errorCode?: number },
        },
        initial: "idle",
        states: {
            idle: {
                on: {
                    JOIN: { target: "confirming", actions: ["setHunt"] },
                },
            },
            confirming: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            CONFIRMATION_CONFIRMED: {
                                target: "#joinDrivenHuntUsingButton.joining",
                                actions: ["resetHunt"],
                            },
                            CONFIRMATION_REJECTED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingButton.idle" },
                        },
                    },
                },
            },
            joining: {
                on: {
                    JOIN_SUCCESS: { target: "success" },
                    JOIN_FAILURE_NETWORK: { target: "failureNetwork" },
                    JOIN_FAILURE_CODE: { target: "failureCode", actions: ["setErrorCode"] },
                    JOIN_FAILURE_OTHER: { target: "failureOther" },
                },
                invoke: { src: "join" },
            },
            success: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            SUCCESS_CONFIRMED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingButton.idle" },
                        },
                    },
                },
            },
            failureNetwork: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            FAILURE_CONFIRMED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingButton.idle" },
                        },
                    },
                },
            },
            failureCode: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            FAILURE_CONFIRMED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingButton.idle" },
                        },
                    },
                },
            },
            failureOther: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            FAILURE_CONFIRMED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingButton.idle", actions: ["resetErrorCode"] },
                        },
                    },
                },
            },
        },
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        actions: {
            setHunt: assign({
                hunt: (context, event) => {
                    if (event.type === "JOIN") {
                        return {
                            title: event.title,
                            eventGuid: event.eventGuid,
                        };
                    }
                    return context.hunt;
                },
            }),
            resetHunt: assign({
                hunt: undefined,
            }),
            setErrorCode: assign({
                errorCode: (context, event) => {
                    if (event.type === "JOIN_FAILURE_CODE") {
                        return event.errorCode;
                    }
                    return context.errorCode;
                },
            }),
            resetErrorCode: assign({
                errorCode: undefined,
            }),
        },
        services: {
            join: (context, event) => (send) => {
                if (event.type !== "CONFIRMATION_CONFIRMED") {
                    logger.error(`Expected event type "CONFIRMATION_CONFIRMED", got "${event.type}"`);
                    send({ type: "JOIN_FAILURE_OTHER" });
                    return;
                }

                async function join(
                    eventGuid: string,
                    participantGuid: string,
                    fullName: string,
                    participantRoleId: ParticipantRole
                ) {
                    try {
                        const network = await NetInfo.fetch();
                        if (!network.isConnected || !network.isInternetReachable) {
                            send({ type: "JOIN_FAILURE_NETWORK" });
                            return;
                        }

                        const result = await api.joinHunt({ eventGuid, participantGuid, fullName, participantRoleId });
                        if (!result.success) {
                            if (result.errorCode) {
                                send({ type: "JOIN_FAILURE_CODE", errorCode: result.errorCode });
                            } else {
                                send({ type: "JOIN_FAILURE_OTHER" });
                            }
                            return;
                        }

                        await queryClient.invalidateQueries(queryKeys.hunts);

                        send({ type: "JOIN_SUCCESS" });
                    } catch (error) {
                        logger.error("Failed to join hunt due to an unexpected error", error);
                        send({ type: "JOIN_FAILURE_OTHER" });
                    }
                }
                join(event.eventGuid, event.participantGuid, event.fullName, event.role);
            },
        },
    }
);

type Props = {
    visible: boolean;
    hunt: Hunt;
};

export function JoinDrivenHuntUsingButton({ visible, hunt }: Props) {
    const { t } = useTranslation();
    const profile = useProfile();
    const classifiers = useClassifiers();
    const [state, send, service] = useMachine(() => joinDrivenHuntUsingButtonMachine);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "JDHUB " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    return (
        <>
            {visible ? (
                <Button
                    title={t("hunt.drivenHunt.join.join")}
                    onPress={() => {
                        const title = getHuntTitle(hunt.vmdCode, hunt.districts, hunt.plannedFrom);
                        send({ type: "JOIN", title, eventGuid: hunt.guid });
                    }}
                />
            ) : null}

            <Modal
                visible={
                    !state.matches("idle") &&
                    !state.matches({ confirming: "closing" }) &&
                    !state.matches({ success: "closing" }) &&
                    !state.matches({ failureNetwork: "closing" }) &&
                    !state.matches({ failureCode: "closing" }) &&
                    !state.matches({ failureOther: "closing" })
                }
                onBackButtonPress={() => {
                    if (state.can("CONFIRMATION_REJECTED")) {
                        send({ type: "CONFIRMATION_REJECTED" });
                    }
                }}
            >
                {match(state)
                    .with({ value: { confirming: P.any }, context: { hunt: P.not(P.nullish) } }, (state) => {
                        const { title, eventGuid } = state.context.hunt;
                        return (
                            <HunterConfirmation
                                huntTitle={title}
                                onConfirm={(role) => {
                                    send({
                                        type: "CONFIRMATION_CONFIRMED",
                                        eventGuid,
                                        participantGuid: randomUUID(),
                                        fullName: [profile.firstName, profile.lastName].join(" "),
                                        role,
                                    });
                                }}
                                onReject={() => {
                                    send({ type: "CONFIRMATION_REJECTED" });
                                }}
                            />
                        );
                    })
                    .with({ value: "joining" }, () => {
                        return <LoadingMessage title={t("hunt.drivenHunt.join.joining.title")} />;
                    })
                    .with({ value: { success: P.any } }, () => {
                        return (
                            <SuccessMessage
                                onContinue={() => {
                                    send({ type: "SUCCESS_CONFIRMED" });
                                }}
                            />
                        );
                    })
                    .with({ value: { failureScanner: P.any } }, () => {
                        return (
                            <FailureMessage
                                title={t("hunt.drivenHunt.join.failureScanner.title")}
                                description={t("hunt.drivenHunt.join.failureScanner.description")}
                                onClose={() => {
                                    send({ type: "FAILURE_CONFIRMED" });
                                }}
                            />
                        );
                    })
                    .with({ value: { failureNetwork: P.any } }, () => {
                        return (
                            <FailureMessage
                                title={t("hunt.drivenHunt.join.failureNetwork.title")}
                                description={t("hunt.drivenHunt.join.failureNetwork.description")}
                                onClose={() => {
                                    send({ type: "FAILURE_CONFIRMED" });
                                }}
                            />
                        );
                    })
                    .with({ value: { failureCode: P.any }, context: { errorCode: P.number } }, (state) => {
                        const description =
                            getErrorMessageFromApi(state.context.errorCode, classifiers) ??
                            t("hunt.drivenHunt.join.failureErrorCode.descriptionFallback");
                        return (
                            <FailureMessage
                                title={t("hunt.drivenHunt.join.failureErrorCode.title")}
                                description={description}
                                onClose={() => {
                                    send({ type: "FAILURE_CONFIRMED" });
                                }}
                            />
                        );
                    })
                    .with({ value: { failureOther: P.any } }, () => {
                        return (
                            <FailureMessage
                                title={t("hunt.drivenHunt.join.failureOther.title")}
                                description={t("hunt.drivenHunt.join.failureOther.description")}
                                onClose={() => {
                                    send({ type: "FAILURE_CONFIRMED" });
                                }}
                            />
                        );
                    })
                    .otherwise(() => null)}
            </Modal>
        </>
    );
}
