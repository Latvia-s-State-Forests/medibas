import { jwtDecode } from "jwt-decode";
import { AuthenticationService, PendingSession } from "../types/authentication";

export function getTokenExpirationDate(token: string): string {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return new Date(exp * 1000).toISOString();
}

export function getTimeUntilTokenExpiration(tokenExpirationDate: string, offset = 0): number {
    const expirationTime = new Date(tokenExpirationDate).getTime();
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime - offset;
    return Math.max(timeUntilExpiration, 0);
}

export function isTokenActive(token: string) {
    const expirationDate = getTokenExpirationDate(token);
    const timeUntilExpiration = getTimeUntilTokenExpiration(expirationDate);
    return timeUntilExpiration > 0;
}

export function isPendingSessionActive({ timestamp }: PendingSession) {
    // This limit value is arbitrary. It's made up based on a personal assumption that 5 minutes should be enough to
    // complete the login process.
    const limit = 5 * 60 * 1000; // 5 minutes
    return Date.now() < timestamp + limit;
}

export function getAccessToken(service: AuthenticationService): string | undefined {
    return service.getSnapshot().context.session?.accessToken;
}

export function getUserId(service: AuthenticationService): string | undefined {
    const session = service.getSnapshot().context.session;
    if (!session) {
        return;
    }
    const { sub: userId } = jwtDecode<{ sub: string }>(session.accessToken);
    return userId;
}
