import * as SecureStore from "expo-secure-store";
import { PendingSession, Session, pendingSessionSchema, sessionSchema } from "~/types/authentication";
import { SecureStorageKey } from "~/types/storage";

export function setPin(pin: string): Promise<void> {
    return SecureStore.setItemAsync(SecureStorageKey.AuthenticationPin, pin);
}

export async function getPin(): Promise<string | undefined> {
    const result = await SecureStore.getItemAsync(SecureStorageKey.AuthenticationPin);
    if (!result) {
        return;
    }
    return result;
}

export function deletePin(): Promise<void> {
    return SecureStore.deleteItemAsync(SecureStorageKey.AuthenticationPin);
}

export async function getRemainingPinAttempts(): Promise<number | undefined> {
    const result = await SecureStore.getItemAsync(SecureStorageKey.RemainingAuthenticationPinAttempts);
    if (result === null) {
        return;
    }
    return Number(result);
}

export function setRemainingPinAttempts(attempts: number): Promise<void> {
    return SecureStore.setItemAsync(SecureStorageKey.RemainingAuthenticationPinAttempts, String(attempts));
}

export function deleteRemainingPinAttempts(): Promise<void> {
    return SecureStore.deleteItemAsync(SecureStorageKey.RemainingAuthenticationPinAttempts);
}

export async function getSession(): Promise<Session | undefined> {
    const method = await SecureStore.getItemAsync(SecureStorageKey.AuthenticationMethod);
    if (!method) {
        return;
    }
    const accessToken = await SecureStore.getItemAsync(SecureStorageKey.AccessToken);
    if (!accessToken) {
        return;
    }
    const refreshToken = await SecureStore.getItemAsync(SecureStorageKey.RefreshToken);
    if (!refreshToken) {
        return;
    }

    return sessionSchema.parse({ method, accessToken, refreshToken });
}

export async function setSession(session: Session): Promise<void> {
    await SecureStore.setItemAsync(SecureStorageKey.AuthenticationMethod, session.method);
    await SecureStore.setItemAsync(SecureStorageKey.AccessToken, session.accessToken);
    await SecureStore.setItemAsync(SecureStorageKey.RefreshToken, session.refreshToken);
}

export async function deleteSession(): Promise<void> {
    await SecureStore.deleteItemAsync(SecureStorageKey.AuthenticationMethod);
    await SecureStore.deleteItemAsync(SecureStorageKey.AccessToken);
    await SecureStore.deleteItemAsync(SecureStorageKey.RefreshToken);
}

export async function getPendingSession(): Promise<PendingSession | undefined> {
    const rawPendingSession = await SecureStore.getItemAsync(SecureStorageKey.PendingSession);
    if (!rawPendingSession) {
        return;
    }
    return pendingSessionSchema.parse(JSON.parse(rawPendingSession));
}

export async function setPendingSession(pendingSession: PendingSession): Promise<void> {
    await SecureStore.setItemAsync(SecureStorageKey.PendingSession, JSON.stringify(pendingSession));
}

export async function deletePendingSession(): Promise<void> {
    await SecureStore.deleteItemAsync(SecureStorageKey.PendingSession);
}

export async function clear(): Promise<void> {
    await Promise.all([
        SecureStore.deleteItemAsync(SecureStorageKey.AuthenticationMethod),
        SecureStore.deleteItemAsync(SecureStorageKey.AccessToken),
        SecureStore.deleteItemAsync(SecureStorageKey.RefreshToken),
        SecureStore.deleteItemAsync(SecureStorageKey.PendingSession),
        SecureStore.deleteItemAsync(SecureStorageKey.AuthenticationPin),
        SecureStore.deleteItemAsync(SecureStorageKey.RemainingAuthenticationPinAttempts),
    ]);
}
