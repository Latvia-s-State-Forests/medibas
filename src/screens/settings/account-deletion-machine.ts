import { assign, createMachine } from "xstate";
import { api } from "~/api";
import { logger } from "~/logger";
import { authenticationService } from "~/machines/authentication-machine";
import { queryClient } from "~/query-client";
import { networkStatusMachine } from "~/utils/network-status-machine";

const COUNTDOWN_SECONDS = 10;

export const accountDeletionMachine = createMachine(
    {
        context: { countdown: COUNTDOWN_SECONDS },
        schema: {
            context: {} as { countdown: number },
            events: {} as
                | { type: "DELETE" }
                | { type: "CONFIRM" }
                | { type: "REJECT" }
                | { type: "NETWORK_AVAILABLE" }
                | { type: "NETWORK_UNAVAILABLE" }
                | { type: "DELETE_SUCCESS" }
                | { type: "DELETE_FAILURE" }
                | { type: "RETRY" },
        },
        preserveActionOrder: true,
        predictableActionArguments: true,
        id: "accountDeletion",
        initial: "idle",
        states: {
            idle: {
                on: {
                    DELETE: {
                        target: "confirming",
                    },
                },
            },
            confirming: {
                entry: "resetCountdown",
                initial: "waitingForCountdown",
                states: {
                    waitingForCountdown: {
                        after: {
                            "1000": {
                                target: "waitingForCountdown",
                                actions: ["decrementCountdown"],
                            },
                        },
                        always: {
                            target: "waitingForConfirmation",
                            cond: "isCountdownComplete",
                        },
                    },
                    waitingForConfirmation: {
                        on: {
                            CONFIRM: {
                                target: "#accountDeletion.verifyingNetworkConnection",
                            },
                        },
                    },
                },
                on: {
                    REJECT: {
                        target: "idle",
                    },
                },
            },
            verifyingNetworkConnection: {
                invoke: {
                    src: networkStatusMachine,
                },
                on: {
                    NETWORK_AVAILABLE: {
                        target: "deleting",
                    },
                    NETWORK_UNAVAILABLE: {
                        target: "#accountDeletion.failure",
                    },
                },
            },
            deleting: {
                invoke: {
                    src: "deleteAccount",
                },
                on: {
                    DELETE_SUCCESS: {
                        target: "#accountDeletion.success",
                    },
                    DELETE_FAILURE: {
                        target: "#accountDeletion.failure",
                    },
                },
            },
            success: {
                after: {
                    "3000": { actions: ["removeUserData", "logout"] },
                },
            },
            failure: {
                on: {
                    RETRY: {
                        target: "#accountDeletion.deleting",
                    },
                },
            },
        },
    },
    {
        actions: {
            resetCountdown: assign({
                countdown: COUNTDOWN_SECONDS,
            }),
            decrementCountdown: assign({
                countdown: (context) => context.countdown - 1,
            }),
            logout: () => {
                authenticationService.send({ type: "LOGOUT" });
            },
            removeUserData: () => {
                queryClient.clear();
            },
        },
        guards: {
            isCountdownComplete: (context) => context.countdown === 0,
        },
        services: {
            deleteAccount: () => (send) => {
                let ignore = false;

                api.deleteProfile()
                    .then((response) => {
                        if (ignore) {
                            return;
                        }

                        if (response.status === "ok") {
                            send({ type: "DELETE_SUCCESS" });
                        } else {
                            send({ type: "DELETE_FAILURE" });
                        }
                    })
                    .catch((error) => {
                        if (ignore) {
                            return;
                        }

                        logger.error({ message: "Failed to delete account", error });
                        send({ type: "DELETE_FAILURE" });
                    });

                return () => {
                    ignore = true;
                };
            },
        },
    }
);
