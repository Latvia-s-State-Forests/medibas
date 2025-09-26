import { assign, fromCallback, setup } from "xstate";
import { api } from "~/api";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { ErrorMessageClassifierOption } from "~/types/classifiers";
import { PostContractPermitsBody } from "~/types/contracts";
import { networkStatusMachine } from "~/utils/network-status-machine";

type PermitDistributionContext = {
    data?: PostContractPermitsBody;
    errorMessage?: string;
    errorMessages: ErrorMessageClassifierOption[];
};

type PermitDistributionEvent =
    | { type: "SUBMIT"; data: PostContractPermitsBody }
    | { type: "RETRY" }
    | { type: "CANCEL" }
    | { type: "CLOSE" }
    | { type: "NETWORK_AVAILABLE" }
    | { type: "NETWORK_UNAVAILABLE" }
    | { type: "SUBMIT_SUCCESS" }
    | { type: "SUBMIT_FAILURE"; errorMessage?: string }
    | { type: "REFETCH_CONTRACTS_SUCCESS" }
    | { type: "REFETCH_CONTRACTS_FAILURE" }
    | { type: "REFETCH_PERMITS_FAILURE" }
    | { type: "REFETCH_PERMITS_SUCCESS" };

export const permitDistributionMachine = setup({
    types: {
        context: {} as PermitDistributionContext,
        events: {} as PermitDistributionEvent,
    },
    actions: {
        setData: assign({
            data: ({ context, event }) => {
                if (event.type === "SUBMIT") {
                    return event.data;
                }
                return context.data;
            },
        }),
        resetData: assign({
            data: undefined,
        }),
        setErrorMessage: assign({
            errorMessage: ({ context, event }) => {
                if (event.type === "SUBMIT_FAILURE") {
                    return event.errorMessage;
                }
                return context.errorMessage;
            },
        }),
        resetErrorMessage: assign({
            errorMessage: undefined,
        }),
        close: () => {
            // handled externally
        },
    },
    actors: {
        submitPermitDistribution: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: PermitDistributionEvent) => void;
                input: { data?: PostContractPermitsBody };
            }) => {
                if (!input.data) {
                    logger.error("PDM failed to submit permit distribution, missing data");
                    sendBack({ type: "SUBMIT_FAILURE" });
                    return;
                }
                // TODO extract error message
                api.postContractPermits(input.data)
                    .then(() => {
                        sendBack({ type: "SUBMIT_SUCCESS" });
                    })
                    .catch((error) => {
                        logger.error("PDM failed to submit permit distribution", error);
                        sendBack({ type: "SUBMIT_FAILURE" });
                    });
            }
        ),
        refetchContracts: fromCallback(({ sendBack }: { sendBack: (event: PermitDistributionEvent) => void }) => {
            queryClient
                .refetchQueries({ queryKey: queryKeys.contracts }, { throwOnError: true })
                .then(() => {
                    sendBack({ type: "REFETCH_CONTRACTS_SUCCESS" });
                })
                .catch((error) => {
                    logger.error("PDM failed to refetch contracts", error);
                    sendBack({ type: "REFETCH_CONTRACTS_FAILURE" });
                });
        }),
        refetchPermits: fromCallback(({ sendBack }: { sendBack: (event: PermitDistributionEvent) => void }) => {
            queryClient
                .refetchQueries({ queryKey: queryKeys.permits }, { throwOnError: true })
                .then(() => {
                    sendBack({ type: "REFETCH_PERMITS_SUCCESS" });
                })
                .catch((error) => {
                    logger.error("PDM failed to refetch permits", error);
                    sendBack({ type: "REFETCH_PERMITS_FAILURE" });
                });
        }),
    },
}).createMachine({
    id: "permitDistribution",
    initial: "idle",
    context: {
        errorMessages: [],
    },
    states: {
        idle: {
            on: {
                SUBMIT: {
                    target: "loading",
                    actions: ["setData"],
                },
            },
        },
        loading: {
            initial: "verifyingNetworkConnection",
            states: {
                verifyingNetworkConnection: {
                    invoke: { src: networkStatusMachine },
                    on: {
                        NETWORK_AVAILABLE: {
                            target: "submitting",
                        },
                        NETWORK_UNAVAILABLE: {
                            target: "#permitDistribution.failure.network",
                        },
                    },
                },
                submitting: {
                    invoke: {
                        src: "submitPermitDistribution",
                        input: ({ context }) => ({ data: context.data }),
                    },
                    on: {
                        SUBMIT_SUCCESS: {
                            target: "refetchingContracts",
                        },
                        SUBMIT_FAILURE: {
                            target: "#permitDistribution.failure.submission",
                            actions: ["setErrorMessage"],
                        },
                    },
                },
                refetchingContracts: {
                    invoke: { src: "refetchContracts" },
                    on: {
                        REFETCH_CONTRACTS_SUCCESS: {
                            target: "refetchingPermits",
                        },
                        REFETCH_CONTRACTS_FAILURE: {
                            target: "#permitDistribution.failure.contracts",
                        },
                    },
                },
                refetchingPermits: {
                    invoke: { src: "refetchPermits" },
                    on: {
                        REFETCH_PERMITS_SUCCESS: {
                            target: "#permitDistribution.success",
                        },
                        REFETCH_PERMITS_FAILURE: {
                            target: "#permitDistribution.failure.permits",
                        },
                    },
                },
            },
        },
        success: {
            after: {
                3000: { target: "idle", actions: ["resetData", "close"] },
            },
            on: {
                CLOSE: { target: "idle", actions: ["resetData", "close"] },
            },
        },
        failure: {
            on: {
                CANCEL: {
                    target: "#permitDistribution.idle",
                    actions: ["resetData"],
                },
            },
            exit: "resetErrorMessage",
            initial: "submission",
            states: {
                network: {
                    on: {
                        RETRY: {
                            target: "#permitDistribution.loading",
                        },
                    },
                },
                submission: {
                    on: {
                        RETRY: {
                            target: "#permitDistribution.loading.submitting",
                        },
                    },
                },
                contracts: {
                    on: {
                        RETRY: {
                            target: "#permitDistribution.loading.refetchingContracts",
                        },
                    },
                },
                permits: {
                    on: {
                        RETRY: {
                            target: "#permitDistribution.loading.refetchingPermits",
                        },
                    },
                },
            },
        },
    },
});
