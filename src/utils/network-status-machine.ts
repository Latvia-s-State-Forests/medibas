import NetInfo from "@react-native-community/netinfo";
import { fromCallback, sendParent, setup } from "xstate";

export type NetworkStatusEvent = { type: "NETWORK_AVAILABLE" } | { type: "NETWORK_UNAVAILABLE" };

export const networkStatusMachine = setup({
    types: {
        events: {} as NetworkStatusEvent,
    },
    actions: {
        notifyNetworkAvailable: sendParent({ type: "NETWORK_AVAILABLE" }),
        notifyNetworkUnavailable: sendParent({ type: "NETWORK_UNAVAILABLE" }),
    },
    actors: {
        watchNetworkStatus: fromCallback(({ sendBack }: { sendBack: (event: NetworkStatusEvent) => void }) => {
            const unsubscribe = NetInfo.addEventListener((state) => {
                if (state.isConnected && state.isInternetReachable) {
                    sendBack({ type: "NETWORK_AVAILABLE" });
                } else {
                    sendBack({ type: "NETWORK_UNAVAILABLE" });
                }
            });

            return () => {
                unsubscribe();
            };
        }),
    },
}).createMachine({
    id: "networkStatus",
    invoke: {
        src: "watchNetworkStatus",
    },
    initial: "loading",
    states: {
        loading: {
            on: {
                NETWORK_AVAILABLE: "online",
                NETWORK_UNAVAILABLE: "offline",
            },
        },
        online: {
            entry: "notifyNetworkAvailable",
            on: {
                NETWORK_UNAVAILABLE: "offline",
            },
        },
        offline: {
            entry: "notifyNetworkUnavailable",

            initial: "idle",
            states: {
                idle: {
                    on: {
                        NETWORK_AVAILABLE: "waitingForDelay",
                    },
                },
                // Network is available, but we're waiting for a delay to make sure it's stable
                waitingForDelay: {
                    on: {
                        NETWORK_UNAVAILABLE: "idle",
                    },
                    after: {
                        3000: { target: "#networkStatus.online" },
                    },
                },
            },
        },
    },
});
