import { useActorRef } from "@xstate/react";
import React, { createContext, useContext } from "react";
import { ActorRefFrom } from "xstate";
import { useUserStorage } from "~/machines/authentication-machine";
import { shapesMachine } from "~/machines/shapes-machine";

type ShapesContextType = { actor: ActorRefFrom<typeof shapesMachine> } | null;

const ShapesContext = createContext<ShapesContextType>(null);

export function ShapesProvider({ children }: { children: React.ReactNode }) {
    const userStorage = useUserStorage();
    const actor = useActorRef(shapesMachine, {
        input: {
            userStorage,
        },
    });
    return <ShapesContext.Provider value={{ actor }}>{children}</ShapesContext.Provider>;
}

export function useShapesContext() {
    const context = useContext(ShapesContext);
    if (!context) {
        throw new Error("Shapes Context not initialized");
    }
    return context;
}
