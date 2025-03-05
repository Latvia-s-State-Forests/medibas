import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { createMachine } from "xstate";
import { api } from "~/api";
import { ENV } from "~/env";
import { logger } from "~/logger";
import { queryClient, queryKeys } from "~/query-client";
import { getUserStorage } from "./authentication-machine";

export const vmdConnectMachine = createMachine(
    {
        id: "vmdConnect",
        schema: {
            events: {} as
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
                | { type: "CANCEL" },
        },
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
                invoke: { src: "exchange" },
                on: {
                    EXCHANGE_SUCCESS: "connecting",
                    EXCHANGE_FAILURE: "otherFailure",
                },
            },

            connecting: {
                invoke: { src: "connect" },
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

        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        services: {
            authenticate: () => (send) => {
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
                                    send({ type: "AUTH_FAILURE" });
                                    return;
                                }

                                if (typeof authToken !== "string") {
                                    logger.error("authToken is not a string", url);
                                    send({ type: "AUTH_FAILURE" });
                                    return;
                                }

                                send({
                                    type: "AUTH_SUCCESS",
                                    authToken,
                                    accessToken,
                                });
                            } else if (result.type === "cancel") {
                                send({ type: "AUTH_CANCELLED" });
                            } else {
                                logger.error("Failed to authenticate vmd account", result);
                                send({ type: "AUTH_FAILURE" });
                            }
                        })
                        .catch((error) => {
                            logger.error("Failed to open browser", error);
                            send({ type: "AUTH_FAILURE" });
                        });
                } catch (error) {
                    logger.error("Failed to authenticate vmd account", error);
                    send({ type: "CONNECT_FAILURE" });
                }
            },
            exchange: (context, event) => async (send) => {
                if (event.type !== "AUTH_SUCCESS") {
                    send({ type: "EXCHANGE_FAILURE" });
                    return;
                }
                try {
                    const url = new URL(ENV.VMD_TOKEN_ENDPOINT);
                    url.searchParams.set("accessToken", event.accessToken);
                    url.searchParams.set("authToken", event.authToken);

                    const request = await fetch(url.toString(), { method: "POST" });

                    if (!request.ok) {
                        logger.error("Failed to get exchange vmd token", request.status, await request.text());
                        send({ type: "EXCHANGE_FAILURE" });
                        return;
                    }

                    const response = await request.json();
                    send({ type: "EXCHANGE_SUCCESS", token: response.token });
                } catch (error) {
                    logger.error("Failed to exchange vmd token", error);
                    send({ type: "EXCHANGE_FAILURE" });
                }
            },
            connect: (context, event) => async (send) => {
                if (event.type !== "EXCHANGE_SUCCESS") {
                    send({ type: "CONNECT_FAILURE" });
                    return;
                }
                try {
                    await api.connectVmdAccount(event.token);
                    send({ type: "CONNECT_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to connect vmd account", error);
                    send({ type: "CONNECT_FAILURE" });
                }
            },
            update: () => async (send) => {
                try {
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

                    send({ type: "UPDATE_SUCCESS" });
                } catch (error) {
                    logger.error("Failed to update user data", error);
                    send({ type: "UPDATE_FAILURE" });
                }
            },
        },
    }
);
