import NetInfo from "@react-native-community/netinfo";
import { useMachine } from "@xstate/react";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { match, P } from "ts-pattern";
import { assign, createMachine } from "xstate";
import { api } from "~/api";
import { useInitialUrlContext } from "~/components/initial-url-provider";
import { ENV } from "~/env";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { ParticipantRole } from "~/types/hunts";
import { getErrorMessageFromApi } from "~/utils/error-message-from-api";
import { Modal } from "../modal";
import { BeaterConfirmation } from "./beater-confirmation";
import { FailureMessage } from "./failure-message";
import { getHuntTitle } from "./get-hunt-title";
import { HunterConfirmation } from "./hunter-confirmation";
import { LoadingMessage } from "./loading-message";
import { SuccessMessage } from "./success-message";

const joinDrivenHuntUsingLinkMachine = createMachine(
    {
        id: "joinDrivenHuntUsingLink",
        schema: {
            events: {} as
                | { type: "JOIN"; eventGuid: string }
                | { type: "LOAD_SUCCESS"; title: string; eventGuid: string }
                | { type: "LOAD_FAILURE_EXPIRED"; title: string; eventGuid: string }
                | { type: "LOAD_FAILURE_OTHER" }
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
                    JOIN: { target: "loading" },
                },
            },
            loading: {
                on: {
                    LOAD_SUCCESS: { target: "confirming", actions: ["setHunt"] },
                    LOAD_FAILURE_EXPIRED: { target: "failureExpired", actions: ["setHunt"] },
                    LOAD_FAILURE_OTHER: { target: "failureLoading" },
                },
                invoke: { src: "load" },
            },
            confirming: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            CONFIRMATION_CONFIRMED: {
                                target: "#joinDrivenHuntUsingLink.joining",
                                actions: ["resetHunt"],
                            },
                            CONFIRMATION_REJECTED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingLink.idle" },
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
                            300: { target: "#joinDrivenHuntUsingLink.idle" },
                        },
                    },
                },
            },
            failureLoading: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            FAILURE_CONFIRMED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingLink.idle" },
                        },
                    },
                },
            },
            failureExpired: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            FAILURE_CONFIRMED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingLink.idle", actions: ["resetHunt"] },
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
                            300: { target: "#joinDrivenHuntUsingLink.idle" },
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
                            300: { target: "#joinDrivenHuntUsingLink.idle", actions: ["resetErrorCode"] },
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
                            300: { target: "#joinDrivenHuntUsingLink.idle" },
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
                    if (event.type === "LOAD_SUCCESS" || event.type === "LOAD_FAILURE_EXPIRED") {
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
            load: (context, event) => (send) => {
                if (event.type !== "JOIN") {
                    logger.error(`Expected event type "JOIN", got "${event.type}"`);
                    send({ type: "LOAD_FAILURE_OTHER" });
                    return;
                }
                const { eventGuid } = event;
                api.getDrivenHuntByEventGuid(eventGuid)
                    .then((huntEvent) => {
                        const title = getHuntTitle(huntEvent.vmdCode, huntEvent.districtIds, huntEvent.plannedFrom);
                        if (huntEvent.canJoinHuntEvent) {
                            send({ type: "LOAD_SUCCESS", title, eventGuid });
                        } else {
                            send({ type: "LOAD_FAILURE_EXPIRED", title, eventGuid });
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to get driven hunt by guid", event.eventGuid, error);
                        send({ type: "LOAD_FAILURE_OTHER" });
                    });
            },
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

export function JoinDrivenHuntUsingLink() {
    const { t } = useTranslation();
    const profile = useProfile();
    const classifiers = useClassifiers();
    const [state, send, service] = useMachine(() => joinDrivenHuntUsingLinkMachine);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "JDHUL " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    const { initialUrl, onInitialUrlHandled, initialUrlHandled } = useInitialUrlContext();

    React.useEffect(() => {
        if (initialUrl?.startsWith(ENV.DRIVEN_HUNT_DIRECT_URL) && !initialUrlHandled) {
            const urlParams = new URLSearchParams(initialUrl.split("?")[1]);
            const eventGuid = urlParams.get("guid");
            if (eventGuid) {
                service.send({ type: "JOIN", eventGuid });
                onInitialUrlHandled();
            }
        }
    }, [initialUrl, initialUrlHandled, onInitialUrlHandled, service]);

    React.useEffect(() => {
        // Listens for URL changes while the app is running.
        const subscription = Linking.addEventListener("url", ({ url }) => {
            logger.log("Linking url", url);
            if (url.startsWith(ENV.DRIVEN_HUNT_DIRECT_URL)) {
                const urlParams = new URLSearchParams(url.split("?")[1]);
                const eventGuid = urlParams.get("guid");
                if (eventGuid) {
                    service.send({ type: "JOIN", eventGuid });
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, [service]);

    return (
        <Modal
            visible={
                !state.matches("idle") &&
                !state.matches({ confirming: "closing" }) &&
                !state.matches({ success: "closing" }) &&
                !state.matches({ failureLoading: "closing" }) &&
                !state.matches({ failureExpired: "closing" }) &&
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
                .with({ value: "loading" }, () => {
                    return <LoadingMessage title={t("hunt.drivenHunt.join.loading.title")} />;
                })
                .with({ value: { confirming: P.any }, context: { hunt: P.not(P.nullish) } }, (state) => {
                    const { title, eventGuid } = state.context.hunt;
                    if (profile.validHuntersCardNumber) {
                        return (
                            <HunterConfirmation
                                huntTitle={title}
                                onConfirm={(role) => {
                                    send({
                                        type: "CONFIRMATION_CONFIRMED",
                                        eventGuid,
                                        fullName: [profile.firstName, profile.lastName].join(" "),
                                        role,
                                        participantGuid: randomUUID(),
                                    });
                                }}
                                onReject={() => {
                                    send({ type: "CONFIRMATION_REJECTED" });
                                }}
                            />
                        );
                    } else {
                        return (
                            <BeaterConfirmation
                                huntTitle={title}
                                onConfirm={(fullName) => {
                                    send({
                                        type: "CONFIRMATION_CONFIRMED",
                                        eventGuid,
                                        fullName,
                                        role: ParticipantRole.Beater,
                                        participantGuid: randomUUID(),
                                    });
                                }}
                                onReject={() => {
                                    send({ type: "CONFIRMATION_REJECTED" });
                                }}
                            />
                        );
                    }
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
                .with({ value: { failureExpired: P.any }, context: { hunt: P.not(P.nullish) } }, (state) => {
                    return (
                        <FailureMessage
                            title={t("hunt.drivenHunt.join.failureExpired.title")}
                            description={t("hunt.drivenHunt.join.failureExpired.description", {
                                huntTitle: state.context.hunt.title,
                            })}
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
                .with({ value: { failureLoading: P.any } }, { value: { failureOther: P.any } }, () => {
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
    );
}
