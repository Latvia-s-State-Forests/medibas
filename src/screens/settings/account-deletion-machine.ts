import { assign, fromCallback, setup } from "xstate";
import { api } from "~/api";
import { logger } from "~/logger";
import { authenticationActor } from "~/machines/authentication-machine";
import { queryClient } from "~/query-client";
import { networkStatusMachine } from "~/utils/network-status-machine";

const COUNTDOWN_SECONDS = 10;

type AccountDeletionEvent =
    | { type: "DELETE" }
    | { type: "CONFIRM" }
    | { type: "REJECT" }
    | { type: "NETWORK_AVAILABLE" }
    | { type: "NETWORK_UNAVAILABLE" }
    | { type: "DELETE_SUCCESS" }
    | { type: "DELETE_FAILURE" }
    | { type: "RETRY" };

export const accountDeletionMachine = setup({
    types: {
        context: {} as { countdown: number },
        events: {} as AccountDeletionEvent,
    },
    actions: {
        resetCountdown: assign({
            countdown: COUNTDOWN_SECONDS,
        }),
        decrementCountdown: assign({
            countdown: ({ context }) => context.countdown - 1,
        }),
        logout: () => {
            authenticationActor.send({ type: "LOGOUT" });
        },
        removeUserData: () => {
            queryClient.clear();
        },
    },
    guards: {
        isCountdownComplete: ({ context }) => context.countdown === 0,
    },
    actors: {
        deleteAccount: fromCallback(({ sendBack }: { sendBack: (event: AccountDeletionEvent) => void }) => {
            let ignore = false;

            api.deleteProfile()
                .then((response) => {
                    if (ignore) {
                        return;
                    }

                    if (response.status === "ok") {
                        sendBack({ type: "DELETE_SUCCESS" });
                    } else {
                        sendBack({ type: "DELETE_FAILURE" });
                    }
                })
                .catch((error) => {
                    if (ignore) {
                        return;
                    }

                    logger.error({ message: "Failed to delete account", error });
                    sendBack({ type: "DELETE_FAILURE" });
                });

            return () => {
                ignore = true;
            };
        }),
    },
}).createMachine({
    context: { countdown: COUNTDOWN_SECONDS },
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
                            reenter: true,
                        },
                    },
                    always: {
                        target: "waitingForConfirmation",
                        guard: "isCountdownComplete",
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
});
