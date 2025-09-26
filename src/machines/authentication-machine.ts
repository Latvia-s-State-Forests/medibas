import NetInfo from "@react-native-community/netinfo";
import { useSelector } from "@xstate/react";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import { fetch } from "expo/fetch";
import i18next from "i18next";
import { jwtDecode } from "jwt-decode";
import { assign, createActor, fromCallback, setup } from "xstate";
import { appStorage } from "~/app-storage";
import { configuration } from "~/configuration";
import { ENV } from "~/env";
import { logger } from "~/logger";
import { queryClient } from "~/query-client";
import { profileSchema } from "~/types/profile";
import { UserStorage } from "~/user-storage";
import { getAppVersion } from "~/utils/get-app-version";
import { getUserIdHash } from "~/utils/get-user-id-hash";
import * as SecureStorage from "~/utils/secure-storage";
import { PendingSession, pendingSessionSchema, Session, SessionMethod, sessionSchema } from "../types/authentication";
import {
    getTimeUntilTokenExpiration,
    getTokenExpirationDate,
    isPendingSessionActive,
    isTokenActive,
} from "../utils/authentication";

type AuthenticationEvent =
    | { type: "LAST_USED_VERSION_MATCH" }
    | { type: "LAST_USED_VERSION_MISMATCH" }
    | { type: "LAST_USED_VERSION_MISSING" }
    | { type: "INITIAL_SETUP_COMPLETE" }
    | { type: "PENDING_SESSION_EXISTS"; pendingSession: PendingSession }
    | { type: "PENDING_SESSION_MISSING" }
    | { type: "RESUME_PENDING_SESSION_SUCCESS"; session: Session }
    | { type: "RESUME_PENDING_SESSION_FAILURE" }
    | { type: "SESSION_EXISTS"; session: Session }
    | { type: "SESSION_MISSING" }
    | { type: "NETWORK_AVAILABLE" }
    | { type: "NETWORK_UNAVAILABLE" }
    | { type: "REFRESH_SESSION" }
    | { type: "REFRESH_SESSION_SUCCESS"; session: Session }
    | { type: "REFRESH_SESSION_FAILURE_EXPIRED" }
    | { type: "REFRESH_SESSION_FAILURE_OTHER" }
    | { type: "PIN_EXISTS" }
    | { type: "PIN_MISSING" }
    | { type: "PIN_VALID" }
    | { type: "PIN_INVALID" }
    | { type: "LOGOUT" }
    | { type: "LOGIN" }
    | { type: "REGISTER" }
    | { type: "AUTHENTICATE_SUCCESS"; session: Session }
    | { type: "AUTHENTICATE_CANCELLED" }
    | { type: "AUTHENTICATE_FAILURE" }
    | { type: "FETCH_PROFILE_SUCCESS" }
    | { type: "FETCH_PROFILE_FAILURE" }
    | { type: "INIT_STORAGE_SUCCESS"; storage: UserStorage }
    | { type: "INIT_STORAGE_FAILURE" };

export const authenticationMachine = setup({
    types: {
        events: {} as AuthenticationEvent,
        context: {} as {
            pendingSession?: PendingSession;
            session?: Session;
            failedRefreshCount: number;
            method?: SessionMethod;
            storage?: UserStorage;
        },
    },
    actions: {
        saveLastUsedVersion: () => {
            const currentVersion = getAppVersion();
            appStorage.setLastUsedVersion(currentVersion);
        },
        setPendingSession: assign({
            pendingSession: ({ context, event }) => {
                if (event.type !== "PENDING_SESSION_EXISTS") {
                    return context.pendingSession;
                }
                return event.pendingSession;
            },
        }),
        resetPendingSession: assign({
            pendingSession: undefined,
        }),
        deletePendingSession: async () => {
            try {
                await SecureStorage.deletePendingSession();
            } catch (error) {
                logger.error("Failed to remove pending session from secure storage", error);
            }
        },
        setSession: assign({
            session: ({ context, event }) => {
                if (
                    event.type !== "RESUME_PENDING_SESSION_SUCCESS" &&
                    event.type !== "SESSION_EXISTS" &&
                    event.type !== "REFRESH_SESSION_SUCCESS" &&
                    event.type !== "AUTHENTICATE_SUCCESS"
                ) {
                    return context.session;
                }
                return event.session;
            },
        }),
        resetSession: assign({
            session: undefined,
        }),
        saveSession: async ({ context }) => {
            try {
                await SecureStorage.setSession(context.session!);
            } catch (error) {
                logger.error("Failed to save session to secure storage", error);
            }
        },
        deleteSession: async () => {
            try {
                await SecureStorage.deleteSession();
            } catch (error) {
                logger.error("Failed to remove session from secure storage", error);
            }
        },
        incrementFailedRefreshCount: assign({
            failedRefreshCount: ({ context }) => context.failedRefreshCount + 1,
        }),
        resetFailedRefreshCount: assign({
            failedRefreshCount: 0,
        }),
        setLoginMethod: assign({
            method: "login",
        }),
        setRegisterMethod: assign({
            method: "register",
        }),
        resetMethod: assign({
            method: undefined,
        }),
        setStorage: assign({
            storage: ({ context, event }) => {
                if (event.type !== "INIT_STORAGE_SUCCESS") {
                    return context.storage;
                }
                return event.storage;
            },
        }),
        clearStorage: ({ context }) => {
            context.storage?.deletePushNotificationsToken();
        },
        resetStorage: assign({
            storage: undefined,
        }),
        clearQueryClient: () => {
            queryClient.clear();
        },
    },
    delays: {
        failedRefreshRetryDelay: ({ context }) => {
            const delay = 1000 * 2 ** context.failedRefreshCount;
            return Math.min(delay, 1000 * 60 * 5); // 5 minutes max
        },
        tokenExpirationDelay: ({ context }) => {
            if (!context.session) {
                return 0;
            }

            const expirationDate = getTokenExpirationDate(context.session.accessToken);
            return getTimeUntilTokenExpiration(expirationDate, 60 * 1000); // 1 minute before expiration
        },
    },
    guards: {
        isEventAccessTokenActive: ({ event }) => {
            if (event.type !== "SESSION_EXISTS") {
                return false;
            }

            return isTokenActive(event.session.accessToken);
        },
        isContextAccessTokenActive: ({ context }) => {
            if (!context.session) {
                return false;
            }

            return isTokenActive(context.session.accessToken);
        },
        isFailedRefreshCountLimitReached: ({ context }) => {
            return context.failedRefreshCount >= configuration.authentication.failedRefreshCountLimit;
        },
    },
    actors: {
        authenticate: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: AuthenticationEvent) => void;
                input: { method?: SessionMethod };
            }) => {
                async function authenticate(method?: SessionMethod) {
                    if (!method) {
                        logger.error("Failed to authenticate, no method found");
                        sendBack({ type: "AUTHENTICATE_FAILURE" });
                        return;
                    }
                    const redirectUri = AuthSession.makeRedirectUri({
                        native: ENV.OIDC_REDIRECT_URI,
                    });
                    const discoveryDocument: AuthSession.DiscoveryDocument =
                        method === "login"
                            ? {
                                  authorizationEndpoint: ENV.OIDC_AUTHORIZATION_ENDPOINT_SIGN_IN,
                                  tokenEndpoint: ENV.OIDC_TOKEN_ENDPOINT_SIGN_IN,
                              }
                            : {
                                  authorizationEndpoint: ENV.OIDC_AUTHORIZATION_ENDPOINT_SIGN_UP,
                                  tokenEndpoint: ENV.OIDC_TOKEN_ENDPOINT_SIGN_UP,
                              };

                    let request: AuthSession.AuthRequest;
                    try {
                        request = await AuthSession.loadAsync(
                            {
                                clientId: ENV.OIDC_CLIENT_ID,
                                scopes: ENV.OIDC_SCOPES,
                                redirectUri,
                                extraParams: {
                                    prompt: "login",
                                    ui_locales: i18next.language,
                                },
                            },
                            discoveryDocument
                        );
                        const pendingSession = pendingSessionSchema.parse({
                            timestamp: Date.now(),
                            method,
                            codeVerifier: request.codeVerifier,
                        });
                        await SecureStorage.setPendingSession(pendingSession);
                    } catch (error) {
                        logger.error("Failed to create auth request", error);
                        sendBack({ type: "AUTHENTICATE_FAILURE" });
                        return;
                    }

                    let result: AuthSession.AuthSessionResult;

                    try {
                        result = await request.promptAsync(discoveryDocument, { createTask: false });
                        await SecureStorage.deletePendingSession();
                    } catch (error) {
                        logger.error("Failed to authenticate", error);
                        sendBack({ type: "AUTHENTICATE_FAILURE" });
                        return;
                    }

                    if (result.type === "cancel" || result.type === "dismiss") {
                        sendBack({ type: "AUTHENTICATE_CANCELLED" });
                        return;
                    }

                    if (result.type !== "success") {
                        logger.error("Failed to authenticate, unexpected result type", result);
                        sendBack({ type: "AUTHENTICATE_FAILURE" });
                        return;
                    }

                    try {
                        const exchangeResult = await AuthSession.exchangeCodeAsync(
                            {
                                clientId: ENV.OIDC_CLIENT_ID,
                                code: result.params.code,
                                scopes: ENV.OIDC_SCOPES,
                                extraParams: {
                                    code_verifier: request.codeVerifier ?? "",
                                },
                                redirectUri,
                            },
                            discoveryDocument
                        );
                        const session = sessionSchema.parse({
                            method,
                            accessToken: exchangeResult.accessToken,
                            refreshToken: exchangeResult.refreshToken,
                        });
                        sendBack({ type: "AUTHENTICATE_SUCCESS", session });
                    } catch (error) {
                        logger.error("Failed to authenticate, exchange failed", error);
                        sendBack({ type: "AUTHENTICATE_FAILURE" });
                    }
                }

                authenticate(input.method).catch((error) => {
                    logger.error("Failed to authenticate", error);
                    sendBack({ type: "AUTHENTICATE_FAILURE" });
                });
            }
        ),
        fetchProfile: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: AuthenticationEvent) => void;
                input: { storage?: UserStorage; session?: Session };
            }) => {
                const { session, storage } = input;
                if (!session || !storage) {
                    logger.error("Failed to fetch profile, no session found");
                    sendBack({ type: "FETCH_PROFILE_FAILURE" });
                    return;
                }

                async function fetchProfile(accessToken: string) {
                    const response = await fetch(ENV.API_URL + "/user/profile", {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "X-App-Version": getAppVersion(),
                            "X-Request-Date": new Date().toUTCString(),
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`Response not OK, ${response.status}`);
                    }
                    const json = await response.json();
                    const profile = profileSchema.parse(json);
                    return profile;
                }

                fetchProfile(session.accessToken)
                    .then((profile) => {
                        storage.setProfile(profile);
                        sendBack({ type: "FETCH_PROFILE_SUCCESS" });
                    })
                    .catch((error) => {
                        logger.error("Failed to fetch profile", error);
                        sendBack({ type: "FETCH_PROFILE_FAILURE" });
                    });
            }
        ),
        initializeStorage: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: AuthenticationEvent) => void;
                input: { accessToken?: string };
            }) => {
                if (!input.accessToken) {
                    logger.error("Failed to initialize storage, no session found");
                    sendBack({ type: "INIT_STORAGE_FAILURE" });
                    return;
                }

                async function initializeStorage(accessToken: string) {
                    const { sub: userId } = jwtDecode<{ sub: string }>(accessToken);
                    const userIdHash = await getUserIdHash(userId);
                    const storage = new UserStorage(userIdHash);
                    return storage;
                }

                initializeStorage(input.accessToken)
                    .then((storage) => {
                        sendBack({ type: "INIT_STORAGE_SUCCESS", storage });
                    })
                    .catch((error) => {
                        logger.error("Failed to initialize user storage", error);
                        sendBack({ type: "INIT_STORAGE_FAILURE" });
                    });
            }
        ),
        performInitialSetup: fromCallback(({ sendBack }: { sendBack: (event: AuthenticationEvent) => void }) => {
            SecureStorage.clear()
                .then(() => {
                    sendBack({ type: "INITIAL_SETUP_COMPLETE" });
                })
                .catch((error) => {
                    logger.error("Failed to clear secure storage", error);
                });
        }),
        refreshSession: fromCallback(
            ({ sendBack, input }: { sendBack: (event: AuthenticationEvent) => void; input: { session?: Session } }) => {
                if (!input?.session) {
                    logger.error("Failed to refresh session, no session found");
                    sendBack({ type: "REFRESH_SESSION_FAILURE_EXPIRED" });
                    return;
                }

                const { method, refreshToken } = input.session;

                AuthSession.refreshAsync(
                    {
                        clientId: ENV.OIDC_CLIENT_ID,
                        scopes: ENV.OIDC_SCOPES,
                        refreshToken,
                    },
                    {
                        tokenEndpoint:
                            method === "login" ? ENV.OIDC_TOKEN_ENDPOINT_SIGN_IN : ENV.OIDC_TOKEN_ENDPOINT_SIGN_UP,
                    }
                )
                    .then((result) => {
                        const session = sessionSchema.parse({
                            method,
                            accessToken: result.accessToken,
                            refreshToken: result.refreshToken,
                        });
                        sendBack({ type: "REFRESH_SESSION_SUCCESS", session });
                    })
                    .catch((error) => {
                        logger.error("Failed to refresh session", error);
                        if (error instanceof AuthSession.TokenError && error.code === "invalid_grant") {
                            sendBack({ type: "REFRESH_SESSION_FAILURE_EXPIRED" });
                        } else {
                            sendBack({ type: "REFRESH_SESSION_FAILURE_OTHER" });
                        }
                    });
            }
        ),
        resumePendingSession: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: AuthenticationEvent) => void;
                input: { pendingSession?: PendingSession };
            }) => {
                async function resumePendingSession(pendingSession?: PendingSession) {
                    if (!pendingSession) {
                        throw new Error("No pending session found");
                    }

                    if (!isPendingSessionActive(pendingSession)) {
                        throw new Error("Pending session expired");
                    }
                    const initialUrl = await Linking.getInitialURL();
                    if (!initialUrl?.startsWith(ENV.OIDC_REDIRECT_URI)) {
                        throw new Error("Application not launched from redirect URL");
                    }
                    const parsedUrl = Linking.parse(initialUrl);
                    const code = parsedUrl.queryParams?.code;
                    if (!code || typeof code !== "string") {
                        throw new Error("No authorization code found in redirect URL");
                    }
                    const { method, codeVerifier } = pendingSession;
                    try {
                        const result = await AuthSession.exchangeCodeAsync(
                            {
                                clientId: ENV.OIDC_CLIENT_ID,
                                code,
                                scopes: ENV.OIDC_SCOPES,
                                extraParams: {
                                    code_verifier: codeVerifier,
                                },
                                redirectUri: AuthSession.makeRedirectUri({
                                    native: ENV.OIDC_REDIRECT_URI,
                                }),
                            },
                            {
                                tokenEndpoint:
                                    method === "login"
                                        ? ENV.OIDC_TOKEN_ENDPOINT_SIGN_IN
                                        : ENV.OIDC_TOKEN_ENDPOINT_SIGN_UP,
                            }
                        );
                        const session = sessionSchema.parse({
                            method,
                            accessToken: result.accessToken,
                            refreshToken: result.refreshToken,
                        });
                        return session;
                    } catch (error) {
                        logger.error("Exchange failed", error);
                        throw new Error("Exchange failed");
                    }
                }

                resumePendingSession(input.pendingSession)
                    .then((session) => {
                        sendBack({ type: "RESUME_PENDING_SESSION_SUCCESS", session });
                    })
                    .catch((error) => {
                        logger.error("Failed to resume pending session", error);
                        sendBack({ type: "RESUME_PENDING_SESSION_FAILURE" });
                    });
            }
        ),
        verifyLastUsedVersion: fromCallback(({ sendBack }: { sendBack: (event: AuthenticationEvent) => void }) => {
            const currentVersion = getAppVersion();
            const lastUsedVersion = appStorage.getLastUsedVersion();

            if (!lastUsedVersion) {
                sendBack({ type: "LAST_USED_VERSION_MISSING" });
            } else if (lastUsedVersion !== currentVersion) {
                sendBack({ type: "LAST_USED_VERSION_MISMATCH" });
            } else {
                sendBack({ type: "LAST_USED_VERSION_MATCH" });
            }
        }),
        verifyNetworkConnection: fromCallback(({ sendBack }: { sendBack: (event: AuthenticationEvent) => void }) => {
            NetInfo.fetch()
                .then(({ isConnected, isInternetReachable }) => {
                    if (isConnected && isInternetReachable) {
                        sendBack({ type: "NETWORK_AVAILABLE" });
                    } else {
                        sendBack({ type: "NETWORK_UNAVAILABLE" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to verify network connection", error);
                    sendBack({ type: "NETWORK_UNAVAILABLE" });
                });
        }),
        verifyPendingSession: fromCallback(({ sendBack }: { sendBack: (event: AuthenticationEvent) => void }) => {
            SecureStorage.getPendingSession()
                .then((pendingSession) => {
                    if (pendingSession) {
                        sendBack({ type: "PENDING_SESSION_EXISTS", pendingSession });
                    } else {
                        sendBack({ type: "PENDING_SESSION_MISSING" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to get pending session from secure storage", error);
                    sendBack({ type: "PENDING_SESSION_MISSING" });
                });
        }),
        verifyPin: fromCallback(({ sendBack }: { sendBack: (event: AuthenticationEvent) => void }) => {
            SecureStorage.getPin()
                .then((pin) => {
                    if (pin) {
                        sendBack({ type: "PIN_EXISTS" });
                    } else {
                        sendBack({ type: "PIN_MISSING" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to get pin from secure storage", error);
                    sendBack({ type: "PIN_MISSING" });
                });
        }),
        verifySession: fromCallback(({ sendBack }: { sendBack: (event: AuthenticationEvent) => void }) => {
            SecureStorage.getSession()
                .then((session) => {
                    if (session) {
                        sendBack({ type: "SESSION_EXISTS", session });
                    } else {
                        sendBack({ type: "SESSION_MISSING" });
                    }
                })
                .catch((error) => {
                    logger.error("Failed to get session from secure storage", error);
                    sendBack({ type: "SESSION_MISSING" });
                });
        }),
        waitForNetworkConnection: fromCallback(({ sendBack }: { sendBack: (event: AuthenticationEvent) => void }) => {
            const unsubscribe = NetInfo.addEventListener((state) => {
                if (state.isConnected && state.isInternetReachable) {
                    sendBack({ type: "NETWORK_AVAILABLE" });
                    unsubscribe();
                }
            });

            return () => {
                unsubscribe();
            };
        }),
    },
}).createMachine({
    id: "authentication",
    initial: "loading",
    states: {
        loading: {
            initial: "verifyingLastUsedVersion",
            states: {
                verifyingLastUsedVersion: {
                    invoke: { src: "verifyLastUsedVersion" },
                    on: {
                        LAST_USED_VERSION_MISSING: { target: "performingInitialSetup" },
                        LAST_USED_VERSION_MATCH: { target: "verifyingPendingSession" },
                        LAST_USED_VERSION_MISMATCH: {
                            target: "verifyingPendingSession",
                            actions: "saveLastUsedVersion",
                        },
                    },
                },
                performingInitialSetup: {
                    invoke: { src: "performInitialSetup" },
                    on: {
                        INITIAL_SETUP_COMPLETE: {
                            target: "#authentication.loggedOut",
                            actions: "saveLastUsedVersion",
                        },
                    },
                },
                verifyingPendingSession: {
                    invoke: { src: "verifyPendingSession" },
                    on: {
                        PENDING_SESSION_EXISTS: { target: "resumingPendingSession", actions: "setPendingSession" },
                        PENDING_SESSION_MISSING: { target: "verifyingSession" },
                    },
                },
                resumingPendingSession: {
                    invoke: {
                        src: "resumePendingSession",
                        input: ({ context }) => ({ pendingSession: context.pendingSession }),
                    },
                    on: {
                        RESUME_PENDING_SESSION_SUCCESS: {
                            target: "initializingStorage",
                            actions: ["setSession", "resetPendingSession", "deletePendingSession"],
                        },
                        RESUME_PENDING_SESSION_FAILURE: {
                            target: "#authentication.loggedOut",
                            actions: ["resetPendingSession", "deletePendingSession"],
                        },
                    },
                },
                verifyingSession: {
                    invoke: { src: "verifySession" },
                    on: {
                        SESSION_EXISTS: [
                            {
                                target: "initializingStorage",
                                actions: "setSession",
                                guard: "isEventAccessTokenActive",
                            },
                            { target: "verifyingNetworkConnection", actions: "setSession" },
                        ],
                        SESSION_MISSING: { target: "#authentication.loggedOut" },
                    },
                },
                verifyingNetworkConnection: {
                    invoke: { src: "verifyNetworkConnection" },
                    on: {
                        NETWORK_AVAILABLE: { target: "refreshingSession" },
                        NETWORK_UNAVAILABLE: { target: "initializingStorage" },
                    },
                },
                refreshingSession: {
                    invoke: {
                        src: "refreshSession",
                        input: ({ context }) => ({ session: context.session }),
                    },
                    on: {
                        REFRESH_SESSION_SUCCESS: {
                            target: "initializingStorage",
                            actions: ["setSession", "saveSession"],
                        },
                        REFRESH_SESSION_FAILURE_EXPIRED: {
                            target: "#authentication.loggedOut",
                            actions: ["resetSession", "deleteSession"],
                        },
                        REFRESH_SESSION_FAILURE_OTHER: {
                            target: "initializingStorage",
                            actions: "incrementFailedRefreshCount",
                        },
                    },
                },
                initializingStorage: {
                    invoke: {
                        src: "initializeStorage",
                        input: ({ context }) => ({ accessToken: context.session?.accessToken }),
                    },
                    on: {
                        INIT_STORAGE_SUCCESS: { target: "verifyingPin", actions: "setStorage" },
                        INIT_STORAGE_FAILURE: {
                            target: "#authentication.loggedOut",
                            actions: ["resetSession", "deleteSession"],
                        },
                    },
                },
                verifyingPin: {
                    invoke: { src: "verifyPin" },
                    on: {
                        PIN_EXISTS: { target: "#authentication.validatingPin" },
                        PIN_MISSING: [
                            { target: "#authentication.loggedIn", guard: "isContextAccessTokenActive" },
                            { target: "#authentication.loggedIn.refreshingSession" },
                        ],
                    },
                },
            },
        },
        validatingPin: {
            on: {
                PIN_VALID: [
                    { target: "#authentication.loggedIn", guard: "isContextAccessTokenActive" },
                    { target: "#authentication.loggedIn.refreshingSession" },
                ],
                PIN_INVALID: {
                    target: "#authentication.loggedOut",
                    actions: ["clearStorage", "resetStorage", "resetSession", "deleteSession"],
                },
            },
        },
        loggedIn: {
            initial: "idle",
            on: {
                LOGOUT: {
                    target: "#authentication.loggedOut",
                    actions: ["clearStorage", "resetStorage", "resetSession", "deleteSession", "clearQueryClient"],
                },
                REFRESH_SESSION: {
                    target: "#authentication.loggedIn.refreshingSession",
                },
            },
            states: {
                idle: {
                    after: {
                        tokenExpirationDelay: { target: "refreshingSession" },
                    },
                },
                refreshingSession: {
                    initial: "verifyNetworkConnection",
                    states: {
                        verifyNetworkConnection: {
                            invoke: { src: "verifyNetworkConnection" },
                            on: {
                                NETWORK_AVAILABLE: { target: "refreshing" },
                                NETWORK_UNAVAILABLE: { target: "pendingRetry" },
                            },
                        },
                        waitingForNetworkConnection: {
                            invoke: { src: "waitForNetworkConnection" },
                            on: {
                                NETWORK_AVAILABLE: { target: "refreshing" },
                            },
                        },
                        refreshing: {
                            invoke: {
                                src: "refreshSession",
                                input: ({ context }) => ({ session: context.session }),
                            },
                            on: {
                                REFRESH_SESSION_SUCCESS: {
                                    target: "#authentication.loggedIn.idle",
                                    actions: ["setSession", "resetFailedRefreshCount", "saveSession"],
                                },
                                REFRESH_SESSION_FAILURE_EXPIRED: {
                                    target: "#authentication.loggedOut",
                                    actions: [
                                        "clearStorage",
                                        "resetStorage",
                                        "resetSession",
                                        "deleteSession",
                                        "resetFailedRefreshCount",
                                    ],
                                },
                                REFRESH_SESSION_FAILURE_OTHER: [
                                    {
                                        target: "#authentication.loggedOut",
                                        actions: [
                                            "clearStorage",
                                            "resetStorage",
                                            "resetSession",
                                            "deleteSession",
                                            "resetFailedRefreshCount",
                                        ],
                                        guard: "isFailedRefreshCountLimitReached",
                                    },
                                    {
                                        target: "pendingRetry",
                                        actions: "incrementFailedRefreshCount",
                                    },
                                ],
                            },
                        },
                        pendingRetry: {
                            after: {
                                failedRefreshRetryDelay: { target: "verifyNetworkConnection" },
                            },
                        },
                    },
                },
            },
        },
        loggedOut: {
            initial: "idle",
            states: {
                idle: {
                    on: {
                        LOGIN: { target: "authenticating", actions: "setLoginMethod" },
                        REGISTER: { target: "authenticating", actions: "setRegisterMethod" },
                    },
                },
                authenticating: {
                    exit: "resetMethod",
                    invoke: { src: "authenticate", input: ({ context }) => ({ method: context.method }) },
                    on: {
                        AUTHENTICATE_SUCCESS: {
                            target: "initializingStorage",
                            actions: ["setSession", "saveSession"],
                        },
                        AUTHENTICATE_CANCELLED: { target: "idle" },
                        AUTHENTICATE_FAILURE: { target: "idle" },
                    },
                },
                initializingStorage: {
                    invoke: {
                        src: "initializeStorage",
                        input: ({ context }) => ({ accessToken: context.session?.accessToken }),
                    },
                    on: {
                        INIT_STORAGE_SUCCESS: { target: "fetchingProfile", actions: "setStorage" },
                        INIT_STORAGE_FAILURE: { target: "idle", actions: ["resetSession", "deleteSession"] },
                    },
                },
                fetchingProfile: {
                    invoke: {
                        src: "fetchProfile",
                        input: ({ context }) => ({ session: context.session, storage: context.storage }),
                    },
                    on: {
                        FETCH_PROFILE_SUCCESS: { target: "#authentication.loggedIn" },
                        FETCH_PROFILE_FAILURE: { target: "idle", actions: ["resetSession", "deleteSession"] },
                    },
                },
            },
        },
    },
    context: { failedRefreshCount: 0 },
});

export const authenticationActor = createActor(authenticationMachine, {
    inspect: (inspectEvent) => {
        if (inspectEvent.type === "@xstate.snapshot") {
            const snapshot = inspectEvent.actorRef?.getSnapshot();
            if (snapshot?.machine?.id === authenticationMachine.id) {
                logger.log("🔑 " + JSON.stringify(snapshot.value) + " " + JSON.stringify(inspectEvent.event.type));
            }
        }
    },
});

export const AuthAction = {
    logout() {
        authenticationActor.send({ type: "LOGOUT" });
    },
    pinValid() {
        authenticationActor.send({ type: "PIN_VALID" });
    },
    pinInvalid() {
        authenticationActor.send({ type: "PIN_INVALID" });
    },
} as const;

export function useUserStorage() {
    const userStorage = useSelector(authenticationActor, (state) => state.context.storage);
    if (!userStorage) {
        throw new Error("User storage not available");
    }
    return userStorage;
}

export function getUserStorage(): UserStorage {
    const state = authenticationActor.getSnapshot();

    if (!state.context.storage) {
        throw new Error("User storage not available");
    }

    return state.context.storage;
}

export function getAccessToken(): Promise<string> {
    const state = authenticationActor.getSnapshot();

    if (state.matches("loggedOut")) {
        return Promise.reject(new Error("Logged out"));
    }
    const accessToken = state.context.session?.accessToken;
    if (!accessToken) {
        return Promise.reject(new Error("No access token"));
    }

    if (isTokenActive(accessToken)) {
        return Promise.resolve(accessToken);
    }

    if (state.can({ type: "REFRESH_SESSION" })) {
        authenticationActor.send({ type: "REFRESH_SESSION" });
    }

    return new Promise((resolve, reject) => {
        const subscription = authenticationActor.subscribe((state) => {
            if (state.matches("loggedOut")) {
                reject(new Error("Logged out"));
                subscription.unsubscribe();
                return;
            }

            if (state.matches({ loggedIn: "idle" }) && state.context.session?.accessToken) {
                resolve(state.context.session.accessToken);
                subscription.unsubscribe();
                return;
            }
        });
    });
}
