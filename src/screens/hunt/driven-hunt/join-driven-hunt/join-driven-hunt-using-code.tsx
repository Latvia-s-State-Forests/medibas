import NetInfo from "@react-native-community/netinfo";
import { useMachine } from "@xstate/react";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { match, P } from "ts-pattern";
import { assign, createMachine } from "xstate";
import { api } from "~/api";
import { Button } from "~/components/button";
import { QRScannerModal } from "~/components/qr-code/qr-scanner-modal";
import { useClassifiers } from "~/hooks/use-classifiers";
import { useProfile } from "~/hooks/use-profile";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { ParticipantRole } from "~/types/hunts";
import { getErrorMessageFromApi } from "~/utils/error-message-from-api";
import { decodeHuntQrCode } from "../../encode-hunt-qr-code";
import { Modal } from "../modal";
import { FailureMessage } from "./failure-message";
import { getHuntTitle } from "./get-hunt-title";
import { HunterConfirmation } from "./hunter-confirmation";
import { LoadingMessage } from "./loading-message";
import { SuccessMessage } from "./success-message";

const joinDrivenHuntUsingCodeMachine = createMachine(
    {
        id: "joinDrivenHuntUsingCode",
        schema: {
            events: {} as
                | { type: "OPEN_SCANNER" }
                | { type: "CLOSE_SCANNER" }
                | { type: "SCANNER_SUCCESS"; title: string; eventGuid: string }
                | { type: "SCANNER_FAILURE" }
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
            context: {} as { errorCode?: number },
        },
        initial: "idle",
        states: {
            idle: {
                on: {
                    OPEN_SCANNER: { target: "scanning" },
                },
            },
            scanning: {
                on: {
                    CLOSE_SCANNER: { target: "idle" },
                    SCANNER_SUCCESS: { target: "confirming" },
                    SCANNER_FAILURE: { target: "failureScanner" },
                },
            },
            confirming: {
                on: {
                    CONFIRMATION_CONFIRMED: { target: "joining" },
                    CONFIRMATION_REJECTED: { target: "scanning" },
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
                            300: { target: "#joinDrivenHuntUsingCode.idle" },
                        },
                    },
                },
            },
            failureScanner: {
                initial: "idle",
                states: {
                    idle: {
                        on: {
                            FAILURE_CONFIRMED: { target: "closing" },
                        },
                    },
                    closing: {
                        after: {
                            300: { target: "#joinDrivenHuntUsingCode.idle" },
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
                            300: { target: "#joinDrivenHuntUsingCode.idle" },
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
                            300: { target: "#joinDrivenHuntUsingCode.idle", actions: ["resetErrorCode"] },
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
                            300: { target: "#joinDrivenHuntUsingCode.idle" },
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

export function JoinDrivenHuntUsingCode() {
    const { t } = useTranslation();
    const profile = useProfile();
    const classifiers = useClassifiers();
    const [state, send, service] = useMachine(() => joinDrivenHuntUsingCodeMachine);

    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            const message = "JDHUC " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });

        return () => subscription.unsubscribe();
    }, [service]);

    return (
        <>
            <Button
                icon="scan"
                title={t("hunt.drivenHunt.join.scan")}
                variant="secondary-dark"
                onPress={() => {
                    if (state.can("OPEN_SCANNER")) {
                        send({ type: "OPEN_SCANNER" });
                    }
                }}
            />
            <QRScannerModal
                visible={
                    !state.matches("idle") &&
                    !state.matches({ success: "closing" }) &&
                    !state.matches({ failureScanner: "closing" }) &&
                    !state.matches({ failureNetwork: "closing" }) &&
                    !state.matches({ failureCode: "closing" }) &&
                    !state.matches({ failureOther: "closing" })
                }
                onClose={() => {
                    if (state.can("CLOSE_SCANNER")) {
                        send({ type: "CLOSE_SCANNER" });
                    }
                }}
                onScanned={(qrCode) => {
                    if (!state.matches("scanning")) {
                        return;
                    }
                    try {
                        const { eventGuid, vmdCode, districts, plannedFrom } = decodeHuntQrCode(qrCode);
                        const title = getHuntTitle(vmdCode, districts, plannedFrom);
                        send({ type: "SCANNER_SUCCESS", title, eventGuid });
                    } catch (error) {
                        logger.error("Failed to scan hunt qr code", qrCode, error);
                        send({ type: "SCANNER_FAILURE" });
                    }
                }}
            >
                <Modal
                    visible={!state.matches("scanning")}
                    onBackButtonPress={() => {
                        if (state.can("CONFIRMATION_REJECTED")) {
                            send({ type: "CONFIRMATION_REJECTED" });
                        }
                    }}
                >
                    {match(state)
                        .with({ value: "confirming", event: { type: "SCANNER_SUCCESS" } }, (state) => {
                            const { title, eventGuid } = state.event;
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
            </QRScannerModal>
        </>
    );
}
