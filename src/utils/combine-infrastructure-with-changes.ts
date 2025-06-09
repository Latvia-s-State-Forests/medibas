import { Infrastructure, InfrastructureChange } from "~/types/infrastructure";

export function combineInfrastructureWithChanges(
    infrastructure: Infrastructure[],
    fetched: string | undefined,
    changes: InfrastructureChange[]
): Infrastructure[] {
    if (changes.length === 0) {
        return infrastructure;
    }

    const infrastructureByGuid = new Map<string, Infrastructure>();
    for (const inf of infrastructure) {
        infrastructureByGuid.set(inf.guid, inf);
    }

    for (const change of changes) {
        // Ignore change if synced before infrastructure was updated
        if (change.status === "success" && fetched && change.updated && new Date(fetched) > new Date(change.updated)) {
            continue;
        }
        if (change.type === "delete") {
            infrastructureByGuid.delete(change.infrastructure.guid);
        } else {
            infrastructureByGuid.set(change.infrastructure.guid, change.infrastructure);
        }
    }

    return [...infrastructureByGuid.values()];
}
