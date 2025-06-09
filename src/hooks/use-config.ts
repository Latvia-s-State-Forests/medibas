import * as React from "react";
import { Config } from "~/types/config";

export const ConfigContext = React.createContext<Config | null>(null);

export function useConfig() {
    const config = React.useContext(ConfigContext);

    if (!config) {
        throw new Error("ConfigContext not initialized");
    }

    return config;
}
