import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { fetch } from "expo/fetch";
import { fromCallback, setup } from "xstate";
import { api } from "~/api";
import { ENV } from "~/env";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { getUserStorage } from "./authentication-machine";

type VmdConnectEvent =
    | { type: "CONNECT" }
    | { type: "AUTH_SUCCESS"; accessToken: string; authToken: string }
    | { type: "AUTH_FAILURE" }
    | { type: "AUTH_CANCELLED" }
    | { type: "EXCHANGE_SUCCESS"; token: string }
    | { type: "EXCHANGE_FAILURE" }
    | { type: "CONNECT_SUCCESS" }
    | { type: "CONNECT_FAILURE" }
    | { type: "UPDATE_SUCCESS" }
    | { type: "UPDATE_FAILURE" }
    | { type: "RETRY" }
    | { type: "CANCEL" };

export const vmdConnectMachine = setup({
    types: {
        events: {} as VmdConnectEvent,
    },
    actors: {
        authenticate: fromCallback(({ sendBack }: { sendBack: (event: VmdConnectEvent) => void }) => {
            try {
                const accessToken = Crypto.randomUUID();
                const url = new URL(ENV.VMD_AUTHORIZATION_ENDPOINT);
                url.searchParams.set("returnUrl", ENV.VMD_REDIRECT_URI + "/?authToken=");
                url.searchParams.set("accessToken", accessToken);
                WebBrowser.openAuthSessionAsync(url.toString(), ENV.VMD_REDIRECT_URI, { createTask: false })
                    .then((result) => {
                        if (result.type === "success") {
                            const url = Linking.parse(result.url);
                            const authToken = url.queryParams?.authToken;
                            if (!authToken) {
                                logger.error("authToken is missing", url);
                                sendBack({ type: "AUTH_FAILURE" });
                                return;
                            }
                            if (typeof authToken !== "string") {
                                logger.error("authToken is not a string", url);
                                sendBack({ type: "AUTH_FAILURE" });
                                return;
                            }
                            sendBack({
                                type: "AUTH_SUCCESS",
                                authToken,
                                accessToken,
                            });
                        } else if (result.type === "cancel") {
                            sendBack({ type: "AUTH_CANCELLED" });
                        } else {
                            logger.error("Failed to authenticate vmd account", result);
                            sendBack({ type: "AUTH_FAILURE" });
                        }
                    })
                    .catch((error) => {
                        logger.error("Failed to open browser", error);
                        sendBack({ type: "AUTH_FAILURE" });
                    });
            } catch (error) {
                logger.error("Failed to authenticate vmd account", error);
                sendBack({ type: "CONNECT_FAILURE" });
            }
        }),
        exchange: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: VmdConnectEvent) => void;
                input?: { accessToken: string; authToken: string };
            }) => {
                if (!input) {
                    logger.error("Failed to get exchange vmd token, missing tokens");
                    sendBack({ type: "EXCHANGE_FAILURE" });
                    return;
                }

                async function exchange(accessToken: string, authToken: string) {
                    const url = new URL(ENV.VMD_TOKEN_ENDPOINT);
                    url.searchParams.set("accessToken", accessToken);
                    url.searchParams.set("authToken", authToken);
                    const request = await fetch(url.toString(), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: "{}",
                    });
                    if (!request.ok) {
                        logger.error("Failed to get exchange vmd token", request.status, await request.text());
                        throw new Error(`Response not OK, ${request.status}`);
                    }
                    const { token }: { token: string } = await request.json();
                    return token;
                }

                exchange(input.accessToken, input.authToken)
                    .then((token) => {
                        sendBack({ type: "EXCHANGE_SUCCESS", token });
                    })
                    .catch((error) => {
                        logger.error("Failed to exchange vmd token", error);
                        sendBack({ type: "EXCHANGE_FAILURE" });
                    });
            }
        ),
        connect: fromCallback(
            ({ sendBack, input }: { sendBack: (event: VmdConnectEvent) => void; input?: { token: string } }) => {
                const token = input?.token;
                if (!token) {
                    logger.error("Failed to connect vmd account, missing token");
                    sendBack({ type: "CONNECT_FAILURE" });
                    return;
                }
                api.connectVmdAccount(token)
                    .then(() => {
                        sendBack({ type: "CONNECT_SUCCESS" });
                    })
                    .catch((error) => {
                        logger.error("Failed to connect vmd account", error);
                        sendBack({ type: "CONNECT_FAILURE" });
                    });
            }
        ),
        update: fromCallback(({ sendBack }: { sendBack: (event: VmdConnectEvent) => void }) => {
            async function update() {
                const userStorage = getUserStorage();
                const [profile, permits, memberships, districts, contracts] = await Promise.all([
                    api.getProfile(),
                    api.getPermits(),
                    api.getMemberships(),
                    api.getDistricts(),
                    api.getContracts(),
                ]);
                userStorage.setPermits(permits);
                queryClient.setQueryData(queryKeys.permits, permits);
                userStorage.setMemberships(memberships);
                queryClient.setQueryData(queryKeys.memberships, memberships);
                userStorage.setDistricts(districts);
                queryClient.setQueryData(queryKeys.districts, districts);
                userStorage.setContracts(contracts);
                queryClient.setQueryData(queryKeys.contracts, contracts);
                userStorage.setProfile(profile);
                queryClient.setQueryData(queryKeys.profile, profile);
            }

            update()
                .then(() => {
                    sendBack({ type: "UPDATE_SUCCESS" });
                })
                .catch((error) => {
                    logger.error("Failed to update user data", error);
                    sendBack({ type: "UPDATE_FAILURE" });
                });
        }),
    },
}).createMachine({
    id: "vmdConnect",
    initial: "idle",
    states: {
        idle: {
            on: {
                CONNECT: "authenticating",
            },
        },

        authenticating: {
            invoke: { src: "authenticate" },
            on: {
                AUTH_SUCCESS: "exchanging",
                AUTH_FAILURE: "otherFailure",
                AUTH_CANCELLED: "idle",
            },
        },

        exchanging: {
            invoke: {
                src: "exchange",
                input: ({ event }) => {
                    if (event.type === "AUTH_SUCCESS") {
                        return { accessToken: event.accessToken, authToken: event.authToken };
                    }
                },
            },
            on: {
                EXCHANGE_SUCCESS: "connecting",
                EXCHANGE_FAILURE: "otherFailure",
            },
        },

        connecting: {
            invoke: {
                src: "connect",
                input: ({ event }) => {
                    if (event.type === "EXCHANGE_SUCCESS") {
                        return { token: event.token };
                    }
                },
            },
            on: {
                CONNECT_SUCCESS: "updating",
                CONNECT_FAILURE: "otherFailure",
            },
        },

        updating: {
            invoke: { src: "update" },
            on: {
                UPDATE_SUCCESS: "success",
                UPDATE_FAILURE: "updateFailure",
            },
        },

        success: {
            after: {
                3000: "idle",
            },
        },

        updateFailure: {
            on: {
                RETRY: "updating",
                CANCEL: "idle",
            },
        },

        otherFailure: {
            on: {
                RETRY: "authenticating",
                CANCEL: "idle",
            },
        },
    },
});
