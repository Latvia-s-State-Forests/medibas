import { format } from "date-fns";

export function formatDateTime(date: Date | string): string {
    if (typeof date === "string") {
        date = new Date(date);
    }
    return format(date, "dd.MM.yyyy. HH:mm");
}

export function formatDateTimeToISO(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
}

export function formatDate(date: string) {
    return format(new Date(date), "dd.MM.yyyy");
}

export function formatTime(date: string) {
    return format(new Date(date), "HH:mm");
}
