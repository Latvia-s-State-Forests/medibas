import * as React from "react";
import { Classifiers } from "~/types/classifiers";

export const ClassifiersContext = React.createContext<Classifiers | null>(null);

export function useClassifiers() {
    const classifiers = React.useContext(ClassifiersContext);

    if (!classifiers) {
        throw new Error("ClassifiersContext not initialized");
    }

    return classifiers;
}
