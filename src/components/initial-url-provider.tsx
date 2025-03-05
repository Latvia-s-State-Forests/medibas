import * as React from "react";
import { useContext, useState } from "react";
import { Linking } from "react-native";
import { logger } from "~/logger";

type InitialUrlProviderProps = {
    children: React.ReactNode;
};

type InitialUrlContextType = {
    initialUrl: string | undefined;
    initialUrlHandled: boolean;
    onInitialUrlHandled: () => void;
};

const InitialUrlContext = React.createContext<InitialUrlContextType | null>(null);

export function InitialUrlProvider(props: InitialUrlProviderProps) {
    const [initialUrl, setInitialUrl] = useState<string | undefined>(undefined);
    const [initialUrlHandled, setInitialUrlHandled] = useState(false);

    const onInitialUrlHandled = React.useCallback(() => {
        setInitialUrlHandled(true);
    }, []);

    React.useEffect(() => {
        Linking.getInitialURL().then((url) => {
            setInitialUrl(url ?? undefined);
            logger.log("Initial URL", url);
        });
    }, []);

    return (
        <InitialUrlContext.Provider value={{ initialUrl, onInitialUrlHandled, initialUrlHandled }}>
            {props.children}
        </InitialUrlContext.Provider>
    );
}

export function useInitialUrlContext() {
    const context = useContext(InitialUrlContext);
    if (!context) {
        throw new Error("InitialUrlContext not initialized");
    }
    return context;
}
