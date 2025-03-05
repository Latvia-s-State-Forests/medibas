import NetInfo from "@react-native-community/netinfo";
import { focusManager, onlineManager, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { AppState } from "react-native";
import { queryClient } from "../query-client";

type QueryProviderProps = {
    children: React.ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
    // Queries should update whenever network becomes available
    React.useEffect(() => {
        onlineManager.setEventListener((setOnline) => {
            return NetInfo.addEventListener((state) => {
                setOnline((state.isConnected && state.isInternetReachable) ?? false);
            });
        });
    }, []);

    // Queries should update whenever app is opened from background
    React.useEffect(() => {
        const subscription = AppState.addEventListener("change", (state) => {
            focusManager.setFocused(state === "active");
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
