import { MMKV } from "react-native-mmkv";
import { logger } from "~/logger";
import { Classifiers, classifiersSchema } from "./types/classifiers";
import { Contract } from "./types/contracts";
import { DistrictDamagesPerDistrictId } from "./types/district-damages";
import { District } from "./types/districts";
import { Features } from "./types/features";
import { FormState } from "./types/form-state";
import { HuntActivity } from "./types/hunt-activities";
import { Hunt } from "./types/hunts";
import { Membership } from "./types/mtl";
import { NewsItem } from "./types/news";
import { PushNotificationsToken, pushNotificationsTokenSchema } from "./types/notifications";
import { Permit, permitsSchema } from "./types/permits";
import { Profile, ProfileName } from "./types/profile";
import { Report } from "./types/report";

const keys = {
    classifiers: "Classifiers",
    contracts: "Contracts",
    districtDamagesPerDistrictId: "DistrictDamagesPerDistrictId",
    districts: "Districts",
    features: "Features",
    formState: "FormState",
    huntActivities: "HuntActivities",
    hunts: "Hunts",
    latestHuntFetchDate: "LatestHuntFetchDate",
    latestSeenDate: "LatestSeenDate",
    memberships: "Memberships",
    news: "News",
    pendingPhotoUri: "PendingPhotoUri",
    permits: "Permits",
    profile: "Profile",
    profileName: "ProfileName",
    pushNotificationsToken: "PushNotificationsToken",
    reports: "Reports",
    selectedDistrictId: "SelectedDistrictId",
} as const;

export class UserStorage {
    private storage: MMKV;

    constructor(userIdHash: string) {
        const id = userIdHash + ".storage";
        this.storage = new MMKV({ id });
    }

    public getClassifiers(): Classifiers | undefined {
        const classifiers = this.storage.getString(keys.classifiers);

        if (classifiers) {
            try {
                return classifiersSchema.parse(JSON.parse(classifiers));
            } catch (error) {
                logger.error("Failed to parse classifiers from storage", error);
            }
        }

        return undefined;
    }

    public setClassifiers(classifiers: Classifiers) {
        this.storage.set(keys.classifiers, JSON.stringify(classifiers));
    }

    public getContracts(): Contract[] | undefined {
        const contracts = this.storage.getString(keys.contracts);

        if (contracts) {
            return JSON.parse(contracts);
        }

        return undefined;
    }

    public setContracts(contracts: Contract[]) {
        this.storage.set(keys.contracts, JSON.stringify(contracts));
    }

    public getDistrictDamagesPerDistrictId(): DistrictDamagesPerDistrictId | undefined {
        const damages = this.storage.getString(keys.districtDamagesPerDistrictId);

        if (damages) {
            return JSON.parse(damages);
        }

        return undefined;
    }

    public setDistrictDamagesPerDistrictId(damages: DistrictDamagesPerDistrictId) {
        this.storage.set(keys.districtDamagesPerDistrictId, JSON.stringify(damages));
    }

    public getDistricts(): District[] | undefined {
        const districts = this.storage.getString(keys.districts);

        if (districts) {
            return JSON.parse(districts);
        }

        return undefined;
    }

    public setDistricts(districts: District[]) {
        this.storage.set(keys.districts, JSON.stringify(districts));
    }

    public getFeatures(): Features | undefined {
        const features = this.storage.getString(keys.features);

        if (features) {
            return JSON.parse(features);
        }

        return undefined;
    }

    public setFeatures(features: Features) {
        this.storage.set(keys.features, JSON.stringify(features));
    }

    public getMemberships(): Membership[] | undefined {
        const memberships = this.storage.getString(keys.memberships);

        if (memberships) {
            return JSON.parse(memberships);
        }

        return undefined;
    }

    public setMemberships(memberships: Membership[]) {
        this.storage.set(keys.memberships, JSON.stringify(memberships));
    }

    public getPermits(): Permit[] | undefined {
        const permits = this.storage.getString(keys.permits);

        if (permits) {
            try {
                return permitsSchema.parse(JSON.parse(permits));
            } catch (error) {
                logger.error("Failed to parse permits from storage", error);
            }
        }

        return undefined;
    }

    public setPermits(permits: Permit[]) {
        this.storage.set(keys.permits, JSON.stringify(permits));
    }

    public getProfile(): Profile | undefined {
        const profile = this.storage.getString(keys.profile);

        if (profile) {
            return JSON.parse(profile);
        }

        return undefined;
    }

    public setProfile(profile: Profile) {
        this.storage.set(keys.profile, JSON.stringify(profile));
    }

    public getProfileName(): ProfileName | undefined {
        const profileName = this.storage.getString(keys.profileName);

        if (profileName) {
            return JSON.parse(profileName);
        }

        return undefined;
    }

    public setProfileName(profileName: ProfileName) {
        this.storage.set(keys.profileName, JSON.stringify(profileName));
    }

    public getSelectedDistrictId(): number | undefined {
        return this.storage.getNumber(keys.selectedDistrictId);
    }

    public setSelectedDistrictId(districtId: number) {
        this.storage.set(keys.selectedDistrictId, districtId);
    }

    public deleteSelectedDistrictId() {
        this.storage.delete(keys.selectedDistrictId);
    }

    public getReports(): Report[] | undefined {
        const reports = this.storage.getString(keys.reports);

        if (reports) {
            return JSON.parse(reports);
        }

        return undefined;
    }

    public setReports(reports: Report[]) {
        this.storage.set(keys.reports, JSON.stringify(reports));
    }

    public deleteReports() {
        this.storage.delete(keys.reports);
    }

    public getFormState(): FormState | undefined {
        const formState = this.storage.getString(keys.formState);

        if (formState) {
            return JSON.parse(formState);
        }

        return undefined;
    }

    public setFormState(formState: FormState) {
        this.storage.set(keys.formState, JSON.stringify(formState));
    }

    public deleteFormState() {
        this.storage.delete(keys.formState);
    }

    public getPendingPhotoUri(): string | undefined {
        return this.storage.getString(keys.pendingPhotoUri);
    }

    public setPendingPhotoUri(pendingPhotoUri: string) {
        this.storage.set(keys.pendingPhotoUri, pendingPhotoUri);
    }

    public deletePendingPhotoUri() {
        this.storage.delete(keys.pendingPhotoUri);
    }

    public getHunts(): Hunt[] | undefined {
        const hunts = this.storage.getString(keys.hunts);

        if (hunts) {
            return JSON.parse(hunts);
        }

        return undefined;
    }

    public setHunts(hunts: Hunt[]) {
        this.storage.set(keys.hunts, JSON.stringify(hunts));
    }

    public setLatestHuntFetchDate(date: string) {
        this.storage.set(keys.latestHuntFetchDate, date);
    }

    public getLatestHuntFetchDate(): string | undefined {
        return this.storage.getString(keys.latestHuntFetchDate);
    }

    public getHuntActivities(): HuntActivity[] | undefined {
        const huntActivities = this.storage.getString(keys.huntActivities);

        if (huntActivities) {
            return JSON.parse(huntActivities);
        }

        return undefined;
    }

    public setHuntActivities(huntActivities: HuntActivity[]) {
        this.storage.set(keys.huntActivities, JSON.stringify(huntActivities));
    }

    public deleteHuntActivities() {
        this.storage.delete(keys.huntActivities);
    }

    public getNews(): NewsItem[] | undefined {
        const news = this.storage.getString(keys.news);

        if (news) {
            return JSON.parse(news);
        }

        return undefined;
    }

    public setNews(news: NewsItem[]) {
        this.storage.set(keys.news, JSON.stringify(news));
    }

    public setLatestNewsSeenDate(date: string) {
        this.storage.set(keys.latestSeenDate, date);
    }

    public getLatestNewsSeenDate(): string | undefined {
        return this.storage.getString(keys.latestSeenDate);
    }

    public getPushNotificationsToken(): PushNotificationsToken | undefined {
        const pushNotificationsToken = this.storage.getString(keys.pushNotificationsToken);

        if (pushNotificationsToken) {
            try {
                return pushNotificationsTokenSchema.parse(JSON.parse(pushNotificationsToken));
            } catch (error) {
                logger.error("Failed to parse push notifications token from storage", error);
            }
        }
        return undefined;
    }

    public setPushNotificationsToken(token: PushNotificationsToken) {
        return this.storage.set(keys.pushNotificationsToken, JSON.stringify(token));
    }

    public deletePushNotificationsToken() {
        this.storage.delete(keys.pushNotificationsToken);
    }
}
