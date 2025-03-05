import * as React from "react";
import { useHunts } from "./use-hunts";

export function useHunt(id: number) {
    const hunts = useHunts();
    return React.useMemo(() => {
        return hunts.find((hunt) => hunt.id === id);
    }, [hunts, id]);
}
