import { useActorRef, useSelector } from "@xstate/react";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { ActorRefFrom, and, assign, fromCallback, setup, stateIn } from "xstate";
import { api } from "~/api";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import {
    HuntActivitiesRequest,
    HuntActivitiesRequestActivity,
    HuntActivity,
    HuntActivityType,
    SimplifiedHuntActivity,
} from "~/types/hunt-activities";
import { formatDateTimeToISO } from "~/utils/format-date-time";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";

type HuntActivitiesEvent =
    | NetworkStatusEvent
    | { type: "ADD_ACTIVITY"; activity: HuntActivity }
    | { type: "ADD_ACTIVITIES"; activities: HuntActivity[] }
    | { type: "ACTIVITY_STATUS_CHANGED"; guid: string; status: HuntActivity["status"]; sentDate?: string }
    | { type: "SYNC_SUCCESS" }
    | { type: "SYNC_FAILURE" }
    | { type: "RETRY_ACTIVITY"; guid: string };

const huntActivitiesMachine = setup({
    types: {
        context: {} as { activities: HuntActivity[] },
        events: {} as HuntActivitiesEvent,
    },
    actions: {
        addActivity: assign({
            activities: ({ context, event }) => {
                if (event.type === "ADD_ACTIVITY") {
                    return context.activities.concat(event.activity);
                }
                return context.activities;
            },
        }),
        addActivities: assign({
            activities: ({ context, event }) => {
                if (event.type === "ADD_ACTIVITIES") {
                    return context.activities.concat(event.activities);
                }
                return context.activities;
            },
        }),
        updateActivityStatus: assign({
            activities: ({ context, event }) => {
                if (event.type === "ACTIVITY_STATUS_CHANGED") {
                    return context.activities.map((activity) => {
                        if (activity.guid === event.guid) {
                            return {
                                ...activity,
                                status: event.status,
                                ...(event.sentDate && { sentDate: event.sentDate }),
                            };
                        }
                        return activity;
                    });
                }
                return context.activities;
            },
        }),
        retryActivity: assign({
            activities: ({ context, event }) => {
                if (event.type === "RETRY_ACTIVITY") {
                    return context.activities.map((activity) => {
                        if (activity.guid === event.guid) {
                            const updatedActivity: HuntActivity = { ...activity, status: "pending" };
                            return updatedActivity;
                        }
                        return activity;
                    });
                }
                return context.activities;
            },
        }),
        saveActivities: () => {
            // handled externally
        },
    },
    guards: {
        isSyncPending: ({ context }) => {
            const requests = getHuntActivitiesRequests(context.activities);
            return requests.length > 0;
        },
    },
    actors: {
        syncActivities: fromCallback(
            ({
                sendBack,
                input,
            }: {
                sendBack: (event: HuntActivitiesEvent) => void;
                input?: { activities: HuntActivity[] };
            }) => {
                const activities = input?.activities;

                if (!activities) {
                    logger.error("Failed to sync activities, missing input activities");
                    sendBack({ type: "SYNC_FAILURE" });
                    return;
                }

                let ignore = false;

                async function sync(activities: HuntActivity[]) {
                    let success = true;
                    const requests = getHuntActivitiesRequests(activities);
                    for (const request of requests) {
                        try {
                            for (const activity of request.activities) {
                                sendBack({ type: "ACTIVITY_STATUS_CHANGED", guid: activity.guid, status: "active" });
                            }

                            logger.log("Before activities request", request);
                            await api.postHuntActivities(request);
                            logger.log("After activities request", request);

                            for (const activity of request.activities) {
                                sendBack({
                                    type: "ACTIVITY_STATUS_CHANGED",
                                    guid: activity.guid,
                                    status: "success",
                                    sentDate: new Date().toISOString(),
                                });
                            }
                        } catch (error) {
                            logger.error("Activities request failed", request, error);
                            for (const activity of request.activities) {
                                sendBack({ type: "ACTIVITY_STATUS_CHANGED", guid: activity.guid, status: "failure" });
                            }
                            success = false;
                        }
                    }
                    return success;
                }

                sync(activities)
                    .then((success) => {
                        if (ignore) {
                            return;
                        }
                        if (success) {
                            logger.log("Synced activities with success");
                            sendBack({ type: "SYNC_SUCCESS" });
                        } else {
                            logger.log("Synced activities with failure");
                            sendBack({ type: "SYNC_FAILURE" });
                        }
                    })
                    .catch((error) => {
                        if (ignore) {
                            return;
                        }
                        logger.error("Failed to sync activities", error);
                        sendBack({ type: "SYNC_FAILURE" });
                    });

                return () => {
                    ignore = true;
                };
            }
        ),
    },
}).createMachine({
    id: "huntActivities",
    context: {
        activities: [],
    },
    type: "parallel",
    states: {
        activities: {
            initial: "idle",
            on: {
                ADD_ACTIVITY: {
                    actions: ["addActivity", "saveActivities"],
                },
                ADD_ACTIVITIES: {
                    actions: ["addActivities", "saveActivities"],
                },
                RETRY_ACTIVITY: {
                    actions: ["retryActivity"],
                },
            },
            states: {
                idle: {
                    always: { target: "syncing", guard: and([stateIn({ network: "online" }), "isSyncPending"]) },
                },
                syncing: {
                    invoke: {
                        src: "syncActivities",
                        input: ({ context }) => {
                            return { activities: context.activities };
                        },
                    },
                    on: {
                        ACTIVITY_STATUS_CHANGED: {
                            actions: ["updateActivityStatus", "saveActivities"],
                        },
                        SYNC_SUCCESS: { target: "idle" },
                        SYNC_FAILURE: { target: "idle" },
                    },
                },
            },
        },
        network: {
            invoke: { src: networkStatusMachine },
            initial: "loading",
            states: {
                loading: {
                    on: {
                        NETWORK_AVAILABLE: { target: "online" },
                        NETWORK_UNAVAILABLE: { target: "offline" },
                    },
                },
                online: {
                    on: {
                        NETWORK_UNAVAILABLE: { target: "offline" },
                    },
                },
                offline: {
                    on: {
                        NETWORK_AVAILABLE: { target: "online" },
                    },
                },
            },
        },
    },
});

type HuntActivitiesContextValue = {
    actor: ActorRefFrom<typeof huntActivitiesMachine>;
    createActivity: (simplifiedActivity: SimplifiedHuntActivity) => HuntActivity;
    createActivities: (simplifiedActivities: SimplifiedHuntActivity[]) => HuntActivity[];
    retryActivity: (guid: string) => void;
};

const HuntActivitiesContext = React.createContext<HuntActivitiesContextValue | null>(null);

export function HuntActivitiesProvider({ children }: { children: React.ReactNode }) {
    const userStorage = useUserStorage();

    const actor = useActorRef(
        huntActivitiesMachine.provide({
            actions: {
                saveActivities: ({ context }) => {
                    userStorage.setHuntActivities(context.activities);
                },
            },
        }),
        {
            inspect: (inspectEvent) => {
                if (inspectEvent.type === "@xstate.snapshot") {
                    const snapshot = inspectEvent.actorRef?.getSnapshot();
                    if (snapshot?.machine?.id === huntActivitiesMachine.id) {
                        logger.log("HA " + JSON.stringify(snapshot.value) + " " + JSON.stringify(inspectEvent.event));
                    }
                }
            },
        }
    );

    function createActivity(simplifiedActivity: SimplifiedHuntActivity) {
        const activity: HuntActivity = {
            ...simplifiedActivity,
            guid: randomUUID(),
            date: new Date().toISOString(),
            status: "pending",
        };
        actor.send({ type: "ADD_ACTIVITY", activity });
        return activity;
    }

    function createActivities(simplifiedActivities: SimplifiedHuntActivity[]) {
        const activities: HuntActivity[] = simplifiedActivities.map((simplifiedActivity) => ({
            ...simplifiedActivity,
            guid: randomUUID(),
            date: new Date().toISOString(),
            status: "pending",
        }));
        actor.send({ type: "ADD_ACTIVITIES", activities });
        return activities;
    }

    function retryActivity(guid: string) {
        actor.send({ type: "RETRY_ACTIVITY", guid });
    }

    return (
        <HuntActivitiesContext.Provider value={{ actor, createActivity, createActivities, retryActivity }}>
            {children}
        </HuntActivitiesContext.Provider>
    );
}

export function useHuntActivitiesContext() {
    const context = React.useContext(HuntActivitiesContext);

    if (context === null) {
        throw new Error("HuntActivitiesContext not initialized");
    }

    return context;
}

export function useHuntActivities() {
    const { actor } = useHuntActivitiesContext();
    return useSelector(actor, (state) => state.context.activities);
}

export function useHuntActivitiesCount() {
    const { actor } = useHuntActivitiesContext();
    return useSelector(actor, (state) => state.context.activities.length);
}

export function usePendingHuntActivitiesCount() {
    const { actor } = useHuntActivitiesContext();
    return useSelector(
        actor,
        (state) => state.context.activities.filter((activity) => activity.status !== "success").length
    );
}

function getHuntActivitiesRequests(huntActivities: HuntActivity[]): HuntActivitiesRequest[] {
    const blockedHuntIds = new Set<number>();
    const requests = new Map<number, HuntActivitiesRequest>();

    for (const huntActivity of huntActivities) {
        if (huntActivity.status === "success") {
            continue;
        }
        if (huntActivity.status === "failure") {
            blockedHuntIds.add(huntActivity.huntId);
            continue;
        }
        if (blockedHuntIds.has(huntActivity.huntId)) {
            continue;
        }
        const request = requests.get(huntActivity.huntId);
        const requestActivity = getHuntActivitiesRequestActivity(huntActivity);
        if (request) {
            request.activities.push(requestActivity);
        } else {
            requests.set(huntActivity.huntId, {
                eventId: huntActivity.huntId,
                activities: [requestActivity],
            });
        }
    }

    return [...requests.values()];
}

export function getHuntActivitiesRequestActivity(activity: HuntActivity): HuntActivitiesRequestActivity {
    const date = formatDateTimeToISO(new Date(activity.date));
    switch (activity.type) {
        case HuntActivityType.StartHunt: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
            };
        }
        case HuntActivityType.PauseHunt: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
            };
        }
        case HuntActivityType.ResumeHunt: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
            };
        }
        case HuntActivityType.EndHunt: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
            };
        }
        case HuntActivityType.AddRegisteredHunter: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
                personId: activity.personId,
            };
        }
        case HuntActivityType.DeleteRegisteredHunter: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
            };
        }
        case HuntActivityType.AddGuestHunter: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
                fullName: activity.fullName,
                guestHuntersCardNumber: activity.guestHuntersCardNumber,
            };
        }
        case HuntActivityType.DeleteGuestHunter: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
            };
        }
        case HuntActivityType.AddRegisteredBeater: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
                userId: activity.userId,
                fullName: activity.fullName,
            };
        }
        case HuntActivityType.DeleteRegisteredBeater: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
            };
        }
        case HuntActivityType.AddGuestBeater: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
                fullName: activity.fullName,
            };
        }
        case HuntActivityType.DeleteGuestBeater: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                participantGuid: activity.participantGuid,
            };
        }
        case HuntActivityType.AddDog: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                dogGuid: activity.dogGuid,
                dogBreedId: activity.dogBreedId,
                dogSubbreedId: activity.dogSubbreedId,
                dogBreedOther: activity.dogBreedOther,
                dogCount: activity.dogCount,
            };
        }
        case HuntActivityType.DeleteDog: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                dogGuid: activity.dogGuid,
                dogBreedId: activity.dogBreedId,
                dogSubbreedId: activity.dogSubbreedId,
                dogBreedOther: activity.dogBreedOther,
            };
        }
        case HuntActivityType.AddSpeciesAndGear: {
            return {
                type: activity.type,
                guid: activity.guid,
                date,
                targetSpecies: activity.targetSpecies,
                isSemiAutomaticWeaponUsed: activity.isSemiAutomaticWeaponUsed,
                isLightSourceUsed: activity.isLightSourceUsed,
                isNightVisionUsed: activity.isNightVisionUsed,
                isThermalScopeUsed: activity.isThermalScopeUsed,
            };
        }
    }
}
