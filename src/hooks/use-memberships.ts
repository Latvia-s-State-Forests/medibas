import * as React from "react";
import { Membership } from "~/types/mtl";

export const MembershipsContext = React.createContext<Membership[] | null>(null);

export function useMemberships() {
    const memberships = React.useContext(MembershipsContext);

    if (memberships === null) {
        throw new Error("MembershipsContext not initialized");
    }

    return memberships;
}
