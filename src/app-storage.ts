import { MMKV } from "react-native-mmkv";
import { AppLanguage } from "~/i18n";
import { MapPosition } from "~/types/map";

const keys = {
    lastUsedVersion: "LastUsedVersion",
    language: "Language",
    mapPosition: "MapPosition",
    mapActiveLayerIds: "MapActiveLayerIds",
} as const;

class AppStorage {
    private storage: MMKV;

    constructor() {
        this.storage = new MMKV({ id: "app.storage" });
    }

    public getLastUsedVersion(): string | undefined {
        return this.storage.getString(keys.lastUsedVersion);
    }

    public setLastUsedVersion(version: string) {
        this.storage.set(keys.lastUsedVersion, version);
    }

    public getLanguage(): AppLanguage | undefined {
        return this.storage.getString(keys.language) as AppLanguage | undefined;
    }

    public setLanguage(language: AppLanguage) {
        this.storage.set(keys.language, language);
    }

    public getMapPosition(): MapPosition | undefined {
        const mapPosition = this.storage.getString(keys.mapPosition);

        if (mapPosition) {
            return JSON.parse(mapPosition);
        }

        return undefined;
    }

    public setMapPosition(mapPosition: MapPosition) {
        this.storage.set(keys.mapPosition, JSON.stringify(mapPosition));
    }

    public getMapActiveLayerIds(): string[] | undefined {
        const mapActiveLayerIds = this.storage.getString(keys.mapActiveLayerIds);

        if (mapActiveLayerIds) {
            return JSON.parse(mapActiveLayerIds);
        }

        return undefined;
    }

    public setMapActiveLayerIds(mapActiveLayerIds: string[]) {
        this.storage.set(keys.mapActiveLayerIds, JSON.stringify(mapActiveLayerIds));
    }
}

export const appStorage = new AppStorage();
