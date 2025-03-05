import * as Crypto from "expo-crypto";

export function getUserIdHash(userId: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, userId);
}
