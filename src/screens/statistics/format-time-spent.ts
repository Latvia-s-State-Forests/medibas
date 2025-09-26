import { formatDuration, intervalToDuration } from "date-fns";

export function formatTimeSpent(totalMinutes: number): string {
    if (totalMinutes <= 0) {
        return "0min";
    }

    // Convert minutes to milliseconds for date-fns
    const totalMs = totalMinutes * 60 * 1000;

    // Create duration from milliseconds
    const duration = intervalToDuration({ start: 0, end: totalMs });

    // Format using date-fns with custom format for realistic hunting durations
    const formatted = formatDuration(duration, {
        format: ["days", "hours", "minutes"],
        delimiter: " ",
    });

    // Replace words with short forms to match "1d 13h 12min" format
    return (
        formatted
            .replace(/ days?/g, "d")
            .replace(/ hours?/g, "h")
            .replace(/ minutes?/g, "min") || "0min"
    );
}
