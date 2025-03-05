import * as React from "react";
import { Contract } from "~/types/contracts";

export const ContractsContext = React.createContext<Contract[] | null>(null);

export function useContracts() {
    const contracts = React.useContext(ContractsContext);

    if (contracts === null) {
        throw new Error("ContractsContext not initialized");
    }

    return contracts;
}
