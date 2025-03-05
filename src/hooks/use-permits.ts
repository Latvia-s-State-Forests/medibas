import * as React from "react";
import { useReports } from "~/components/reports-provider";
import { Permit } from "~/types/permits";
import { combinePermitsWithReports } from "~/utils/combine-permits-with-reports";
import { useClassifiers } from "./use-classifiers";

export const PermitsContext = React.createContext<Permit[] | null>(null);

export function usePermits() {
    const permits = React.useContext(PermitsContext);
    const reports = useReports();
    const { permitAllowances } = useClassifiers();

    if (permits === null) {
        throw new Error("PermitsContext not initialized");
    }

    const permitsWithReports = combinePermitsWithReports(permits, reports, permitAllowances.options);
    return permitsWithReports;
}
