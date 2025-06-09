import { useInterpret, useSelector } from "@xstate/react";
import { differenceInDays } from "date-fns";
import { randomUUID } from "expo-crypto";
import * as React from "react";
import { ActorRefFrom, assign, createMachine } from "xstate";
import { api } from "~/api";
import { configuration } from "~/configuration";
import { logger } from "~/logger";
import { useUserStorage } from "~/machines/authentication-machine";
import { queryClient, queryKeys } from "~/query-client";
import { Feature } from "~/types/features";
import { Infrastructure, InfrastructureChange } from "~/types/infrastructure";
import { combineInfrastructureWithChanges } from "~/utils/combine-infrastructure-with-changes";
import { NetworkStatusEvent, networkStatusMachine } from "~/utils/network-status-machine";

type InfrastructureContextValue = {
    infrastructure: Infrastructure[];
    actor: ActorRefFrom<typeof infrastructureChangesMachine>;
};

const InfrastructureContext = React.createContext<InfrastructureContextValue | null>(null);

type InfrastructureProviderProps = {
    children: React.ReactNode;
    queryData: { infrastructure: Infrastructure[]; fetched: string } | undefined;
};

export function InfrastructureProvider({ children, queryData }: InfrastructureProviderProps) {
    const userStorage = useUserStorage();

    const actor = useInterpret(
        () => {
            const storedChanges = userStorage.getInfrastructureChanges() ?? [];

            const activeChanges: InfrastructureChange[] = [];
            const expiredChanges: InfrastructureChange[] = [];

            for (const change of storedChanges) {
                const difference = differenceInDays(new Date(), new Date(change.created));
                if (Math.abs(difference) <= configuration.huntingInfrastructure.daysToKeepChangesFor) {
                    activeChanges.push(change);
                } else {
                    expiredChanges.push(change);
                }
            }

            if (expiredChanges.length > 0) {
                logger.log("Removing expired infrastructure changes", expiredChanges);
                userStorage.setInfrastructureChanges(activeChanges);
            }

            return infrastructureChangesMachine.withContext({
                changes: activeChanges,
            });
        },
        {
            actions: {
                saveChanges: (context) => {
                    userStorage.setInfrastructureChanges(context.changes);
                },
            },
        }
    );

    React.useEffect(() => {
        const subscription = actor.subscribe((state) => {
            const message = "IC " + JSON.stringify(state.value) + " " + JSON.stringify(state.event);
            logger.log(message);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [actor]);

    const changes = useSelector(actor, (state) => state.context.changes);

    const infrastructureWithChanges = React.useMemo(() => {
        if (queryData) {
            return combineInfrastructureWithChanges(queryData.infrastructure, queryData.fetched, changes);
        }
        return combineInfrastructureWithChanges([], undefined, changes);
    }, [queryData, changes]);

    return (
        <InfrastructureContext.Provider value={{ infrastructure: infrastructureWithChanges, actor }}>
            {children}
        </InfrastructureContext.Provider>
    );
}

export function useInfrastructureContext() {
    const context = React.useContext(InfrastructureContext);

    if (context === null) {
        throw new Error("InfrastructureContext not initialized");
    }

    return context;
}

export function useDistrictInfrastructure(districtId: number) {
    const { infrastructure } = useInfrastructureContext();

    const districtInfrastructure = React.useMemo(() => {
        return infrastructure.filter((infrastructure) => infrastructure.huntingDistrictId === districtId);
    }, [infrastructure, districtId]);

    return districtInfrastructure;
}

export function useInfrastructureChangesCount() {
    const { actor } = useInfrastructureContext();
    const count = useSelector(actor, (state) => state.context.changes.length);
    return count;
}

export function usePendingInfrastructureChangesCount() {
    const { actor } = useInfrastructureContext();
    const count = useSelector(
        actor,
        (state) => state.context.changes.filter((change) => change.status !== "success").length
    );
    return count;
}

export function useInfrastructureFeatures() {
    const { infrastructure: infrastructures } = useInfrastructureContext();

    const features = React.useMemo(() => {
        return infrastructures.map(
            (entry): Feature => ({
                type: "Feature",
                properties: {
                    infrastructureTypeId: entry.typeId,
                    description: entry.notes,
                    id: entry.id,
                },
                geometry: {
                    type: "Point",
                    coordinates: [entry.locationX, entry.locationY],
                },
            })
        );
    }, [infrastructures]);

    return { features, data: infrastructures };
}

export function useCreateInfrastructureChange() {
    const { actor } = useInfrastructureContext();
    return React.useCallback(
        (type: InfrastructureChange["type"], infrastructure: Infrastructure) => {
            const change: InfrastructureChange = {
                id: randomUUID(),
                created: new Date().toISOString(),
                status: "pending",
                type,
                infrastructure,
            };
            actor.send({ type: "ADD_CHANGE", change });
            return change;
        },
        [actor]
    );
}

const infrastructureChangesMachine = createMachine(
    {
        id: "infrastructureChanges",
        schema: {
            context: {} as { changes: InfrastructureChange[] },
            events: {} as
                | NetworkStatusEvent
                | { type: "ADD_CHANGE"; change: InfrastructureChange }
                | { type: "RETRY_CHANGE"; id: string }
                | { type: "CHANGE_UPDATED"; change: InfrastructureChange }
                | { type: "SYNC_SUCCESS" }
                | { type: "SYNC_FAILURE" },
        },
        context: {
            changes: [],
        },
        type: "parallel",
        states: {
            infrastructure: {
                on: {
                    ADD_CHANGE: {
                        actions: ["addChange", "saveChanges"],
                    },
                    RETRY_CHANGE: {
                        actions: ["retryChange", "saveChanges"],
                    },
                },
                initial: "idle",
                states: {
                    idle: {
                        always: { target: "syncing", cond: "isSyncPending" },
                    },
                    syncing: {
                        invoke: { src: "sync" },
                        on: {
                            CHANGE_UPDATED: {
                                actions: ["updateChange", "saveChanges"],
                            },
                            SYNC_SUCCESS: { target: "idle", actions: ["updateInfrastructure"] },
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
        preserveActionOrder: true,
        predictableActionArguments: true,
    },
    {
        actions: {
            addChange: assign({
                changes: (context, event) => {
                    if (event.type !== "ADD_CHANGE") {
                        return context.changes;
                    }
                    return context.changes.concat(event.change);
                },
            }),
            retryChange: assign({
                changes: (context, event) => {
                    if (event.type !== "RETRY_CHANGE") {
                        return context.changes;
                    }
                    return context.changes.map((change) => {
                        if (change.id === event.id && change.status === "failure") {
                            const updatedChange: InfrastructureChange = {
                                ...change,
                                status: "pending",
                                updated: new Date().toISOString(),
                            };
                            return updatedChange;
                        }
                        return change;
                    });
                },
            }),
            updateChange: assign({
                changes: (context, event) => {
                    if (event.type !== "CHANGE_UPDATED") {
                        return context.changes;
                    }
                    return context.changes.map((change) => {
                        if (change.id === event.change.id) {
                            return event.change;
                        }
                        // Update related changes with the new infrastructure id
                        if (
                            event.change.status === "success" &&
                            change.infrastructure.guid === event.change.infrastructure.guid
                        ) {
                            const updatedChange: InfrastructureChange = {
                                ...change,
                                updated: new Date().toISOString(),
                                infrastructure: {
                                    ...change.infrastructure,
                                    id: event.change.infrastructure.id,
                                },
                            };
                            return updatedChange;
                        }
                        return change;
                    });
                },
            }),
            updateInfrastructure: () => {
                queryClient.invalidateQueries(queryKeys.infrastructure);
            },
        },
        guards: {
            isSyncPending: (context, event, meta) => {
                const online = meta.state.matches("network.online");
                if (!online) {
                    return false;
                }

                const blockedGuids = new Set<string>();

                for (const change of context.changes) {
                    if (change.status === "success") {
                        continue;
                    }
                    if (change.status === "failure") {
                        blockedGuids.add(change.infrastructure.guid);
                        continue;
                    }
                    if (blockedGuids.has(change.infrastructure.guid)) {
                        continue;
                    }
                    return true;
                }

                return false;
            },
        },
        services: {
            sync: (context) => (send) => {
                let ignore = false;

                async function sync() {
                    const blockedGuids = new Set<string>();
                    const idByGuid = new Map<string, number>();

                    for (const change of context.changes) {
                        if (change.status === "success") {
                            idByGuid.set(change.infrastructure.guid, change.infrastructure.id);
                            continue;
                        }
                        if (change.status === "failure") {
                            blockedGuids.add(change.infrastructure.guid);
                            continue;
                        }
                        if (blockedGuids.has(change.infrastructure.guid)) {
                            continue;
                        }

                        try {
                            const updatedChange: InfrastructureChange = {
                                ...change,
                                status: "active",
                                updated: new Date().toISOString(),
                            };
                            send({ type: "CHANGE_UPDATED", change: updatedChange });
                            if (change.type === "create") {
                                const { id } = await api.addInfrastructure({
                                    guid: change.infrastructure.guid,
                                    location: {
                                        x: change.infrastructure.locationX,
                                        y: change.infrastructure.locationY,
                                    },
                                    typeId: change.infrastructure.typeId,
                                    notes: change.infrastructure.notes,
                                    districtId: change.infrastructure.huntingDistrictId,
                                    createdOnDevice: change.infrastructure.createdOnDevice,
                                    changedOnDevice: change.infrastructure.changedOnDevice,
                                });
                                idByGuid.set(change.infrastructure.guid, id);
                                updatedChange.infrastructure.id = id;
                            } else if (change.type === "update") {
                                const id = idByGuid.get(change.infrastructure.guid) ?? change.infrastructure.id;
                                await api.addInfrastructure({
                                    id,
                                    location: {
                                        x: change.infrastructure.locationX,
                                        y: change.infrastructure.locationY,
                                    },
                                    typeId: change.infrastructure.typeId,
                                    notes: change.infrastructure.notes,
                                    districtId: change.infrastructure.huntingDistrictId,
                                    createdOnDevice: change.infrastructure.createdOnDevice,
                                    changedOnDevice: change.infrastructure.changedOnDevice,
                                });
                                idByGuid.set(change.infrastructure.guid, id);
                                updatedChange.infrastructure.id = id;
                            } else {
                                const id = idByGuid.get(change.infrastructure.guid) ?? change.infrastructure.id;
                                await api.deleteInfrastructure(id);
                                updatedChange.infrastructure.id = id;
                            }
                            updatedChange.status = "success";
                            updatedChange.updated = new Date().toISOString();
                            send({ type: "CHANGE_UPDATED", change: updatedChange });
                        } catch (error) {
                            logger.error("Failed to sync infrastructure change", change, error);
                            send({
                                type: "CHANGE_UPDATED",
                                change: { ...change, status: "failure", updated: new Date().toISOString() },
                            });
                        }
                    }
                }

                sync()
                    .then(() => {
                        if (!ignore) {
                            send({ type: "SYNC_SUCCESS" });
                        }
                    })
                    .catch((error) => {
                        if (!ignore) {
                            logger.error("Failed to sync infrastructure changes", error);
                            send({ type: "SYNC_FAILURE" });
                        }
                    });

                return () => {
                    ignore = true;
                };
            },
        },
    }
);
