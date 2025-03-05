import { PositionResult } from "~/types/position-result";

export function formatPosition(position: PositionResult): string {
    const latitude = position.latitude.toFixed(5);
    const longitude = position.longitude.toFixed(5);
    const accuracy = Math.round(position.accuracy ?? 0);
    if (accuracy) {
        return `${latitude}, ${longitude} (± ${accuracy} m)`;
    }
    return `${latitude}, ${longitude}`;
}
