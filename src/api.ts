import { fetch } from "expo/fetch";
import { z } from "zod";
import { configuration } from "./configuration";
import { ENV } from "./env";
import { logger } from "./logger";
import { getAccessToken } from "./machines/authentication-machine";
import { accountDeletionSchema } from "./types/authentication";
import { Classifiers, classifiersSchema } from "./types/classifiers";
import { Config, configSchema } from "./types/config";
import { Contract, getContractsResponseSchema, PostContractPermitsBody } from "./types/contracts";
import { DistrictDamagesPerDistrictId, districtDamagesPerDistrictIdSchema } from "./types/district-damages";
import { District, districtSchema } from "./types/districts";
import { Features, featuresSchema } from "./types/features";
import { HuntActivitiesRequest } from "./types/hunt-activities";
import { HuntedAnimal, huntedAnimalsSchema } from "./types/hunted-animals";
import {
    ApproveOrRejectIndividualHunt,
    Hunt,
    HuntEvent,
    huntEventSchema,
    huntsSchema,
    JoinHuntBody,
} from "./types/hunts";
import { Infrastructure, infrastructuresSchema } from "./types/infrastructure";
import { MemberRole, Membership, membershipSchema } from "./types/mtl";
import { NewsItem, newsSchema } from "./types/news";
import { PushNotificationsToken } from "./types/notifications";
import { Permit, permitSchema } from "./types/permits";
import { Profile, profileSchema } from "./types/profile";
import { Report, ReportSyncError, ReportSyncResult } from "./types/report";
import { getAppVersion } from "./utils/get-app-version";
import { parsePostReportResponse } from "./utils/parse-post-report-response";
import { getPhotoForFormData } from "./utils/photo";

export interface RegisterMemberBody {
    cardNumber: string;
    addToDistrictIds: number[];
}

export interface RemoveMemberBody {
    cardNumber: string;
    removeFromDistrictIds: number[];
}

export interface UpdateMemberRolesBody {
    cardNumber: string;
    districts: number[];
    add: MemberRole[];
    remove: MemberRole[];
}

export interface DrivenHuntBody {
    id?: number;
    meetingPoint?: {
        x: number;
        y: number;
    };
    districts?: Array<{
        id: number;
        descriptionLv: string;
    }>;
    huntEventTypeId: number;
    plannedFrom: string;
    plannedTo: string;
    meetingTime?: string;
    notes: string;
    districtIds: number[];
    huntManagerPersonId?: number;
    hunters: Array<{
        personId: number;
        guid: string;
        fullName?: string;
        huntersCardNumber?: string;
    }>;
    guestBeaters: Array<{
        fullName: string;
        guid: string;
        guestHunterPermitNumber?: string;
    }>;
    beaters: Array<{
        userId: number;
        guid: string;
        fullName: string;
    }>;
    guestHunters: Array<{
        fullName: string;
        guid: string;
        guestHunterPermitNumber?: string;
    }>;
    targetSpecies: Array<{
        speciesId: number;
        permitTypeId?: number;
    }>;
    guid: string;
    eventGuid?: string;
    hasTargetSpecies: boolean;
    dogs: HuntDog[];
}

export interface HuntDog {
    id?: number;
    guid: string;
    dogBreedId: number;
    dogSubbreedId?: number;
    dogBreedOther?: string;
    count: number;
}

export interface HuntSpecies {
    speciesId: number;
    permitTypeId?: number;
}

export interface IndividualHuntBody {
    id?: number;
    meetingPoint?: {
        x: number;
        y: number;
    };
    districts?: Array<{
        id: number;
        descriptionLv: string;
    }>;
    huntEventTypeId: number;
    huntEventPlaceId: number;
    plannedFrom: string;
    plannedTo: string;
    meetingTime?: string;
    notes: string;
    districtIds: number[];
    propertyName: string;
    isSemiAutomaticWeaponUsed?: boolean;
    isNightVisionUsed?: boolean;
    isLightSourceUsed?: boolean;
    isThermalScopeUsed?: boolean;
    huntManagerPersonId?: number;
    eventGuid?: string;
    isTest: boolean;
    hunters: Array<{
        personId: number;
        guid: string;
        fullName?: string;
        huntersCardNumber?: string;
    }>;
    guestBeaters: Array<{
        fullName: string;
        guid: string;
        guestHunterPermitNumber?: string;
    }>;
    beaters: Array<{
        userId: number;
        guid: string;
        fullName: string;
    }>;
    guestHunters: Array<{
        fullName: string;
        guid: string;
        guestHunterPermitNumber?: string;
    }>;
    targetSpecies: HuntSpecies[];
    guid: string;
    hasTargetSpecies: boolean;
    dogs: HuntDog[];
}

export type InfrastructureBody = {
    id?: number;
    guid?: string;
    location: {
        x: number;
        y: number;
    };
    typeId: number;
    notes?: string;
    districtId: number;
    createdOnDevice?: string;
    changedOnDevice: string;
};

export type DeleteInfrastructure = {
    id: number;
};

class Api {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async getRequestHeaders(accessToken = true) {
        const headers: Record<string, string> = {};

        if (accessToken) {
            const accessToken = await getAccessToken();
            headers["Authorization"] = "Bearer " + accessToken;
        }

        const appVersion = getAppVersion();
        headers["X-App-Version"] = appVersion;

        const requestDate = new Date().toUTCString();
        headers["X-Request-Date"] = requestDate;

        return headers;
    }

    private async request(options: {
        method: "GET" | "POST" | "DELETE";
        path: string;
        schema?: z.Schema;
        body?: unknown;
        headers?: Record<string, string>;
    }) {
        let headers = await this.getRequestHeaders();
        if (options.headers) {
            headers = { ...headers, ...options.headers };
        }

        const response = await fetch(this.baseUrl + options.path, {
            method: options.method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Response not OK: ${response.status}, ${error}`);
        }

        if (options.schema) {
            const json = await response.json();
            return options.schema.parse(json);
        }
        return undefined;
    }

    public async getVersions(): Promise<string[]> {
        const headers = await this.getRequestHeaders(false);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(this.baseUrl + "/app/versions", { headers, signal: controller.signal });

        clearTimeout(timeout);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Response not OK: ${error}`);
        }

        return await response.json();
    }

    public getClassifiers(): Promise<Classifiers> {
        return this.request({ method: "GET", path: "/classifiers", schema: classifiersSchema });
    }

    public async getContracts(): Promise<Contract[]> {
        const { contracts } = await this.request({
            method: "GET",
            path: "/user/contracts",
            schema: getContractsResponseSchema,
        });
        return contracts;
    }

    public async getDistrictDamagesPerDistrictId(): Promise<DistrictDamagesPerDistrictId> {
        const damages = await this.request({
            method: "GET",
            path: "/damages",
            schema: districtDamagesPerDistrictIdSchema,
        });
        return damages;
    }

    public getDistricts(): Promise<District[]> {
        return this.request({ method: "GET", path: "/districts", schema: z.array(districtSchema) });
    }

    public async getFeatures(): Promise<Features> {
        const features: Features = await this.request({ method: "GET", path: "/features", schema: featuresSchema });

        // TODO extract to a separate function and add tests
        const filteredFeatures: Features = Object.entries(features).reduce(
            (acc, [key, value]) => {
                const observationsFeatureIds = new Set<number>();
                const damagesFeatureIds = new Set<number>();

                for (const feature of value) {
                    if (feature.properties.id === undefined) {
                        logger.error(`Feature ${key} has no id`, feature);
                        continue;
                    }

                    if (feature.properties.id === null) {
                        logger.error(`Feature ${key} has null id`, feature);
                        continue;
                    }

                    if (feature.properties.id === "") {
                        logger.error(`Feature ${key} has empty id`, feature);
                        continue;
                    }

                    if (key === "observations") {
                        if (observationsFeatureIds.has(feature.properties.id)) {
                            continue;
                        } else {
                            observationsFeatureIds.add(feature.properties.id);
                        }
                    }

                    if (key === "damages") {
                        if (damagesFeatureIds.has(feature.properties.id)) {
                            continue;
                        } else {
                            damagesFeatureIds.add(feature.properties.id);
                        }
                    }

                    acc[key as keyof typeof acc].push(feature);
                }

                return acc;
            },
            { damages: [], observations: [] } as Features
        );

        return filteredFeatures;
    }

    public getMemberships(): Promise<Membership[]> {
        return this.request({ method: "GET", path: "/memberships", schema: z.array(membershipSchema) });
    }

    public getPermits(): Promise<Permit[]> {
        return this.request({ method: "GET", path: "/user/permits", schema: z.array(permitSchema) });
    }

    public getProfile(): Promise<Profile> {
        return this.request({ method: "GET", path: "/user/profile", schema: profileSchema });
    }

    public async postContractPermits(data: PostContractPermitsBody) {
        const response = await this.request({
            method: "POST",
            path: "/contracts/permits",
            body: data,
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response;
    }

    public async connectVmdAccount(vmdToken: string) {
        return this.request({
            method: "POST",
            path: `/connect/vmd/${vmdToken}`,
            body: {},
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    public async deleteMembership(data: RemoveMemberBody) {
        return this.request({
            method: "POST",
            path: `/memberships`,
            body: data,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    public async registerMembership(data: RegisterMemberBody) {
        return this.request({
            method: "POST",
            path: "/memberships",
            body: data,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    public async updateMemberRoles(body: UpdateMemberRolesBody) {
        return this.request({
            method: "POST",
            path: "/roles",
            body,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    public getHuntedAnimals(): Promise<HuntedAnimal[]> {
        return this.request({ method: "GET", path: "/hunted-animals", schema: huntedAnimalsSchema });
    }

    public getHunts(): Promise<Hunt[]> {
        return this.request({ method: "GET", path: "/hunts", schema: huntsSchema });
    }

    public getDrivenHuntByEventGuid(guid: string): Promise<HuntEvent> {
        return this.request({
            method: "GET",
            path: `/hunts/${guid}`,
            schema: huntEventSchema,
        });
    }

    public getNews(): Promise<NewsItem[]> {
        return this.request({ method: "GET", path: "/user/news", schema: newsSchema });
    }

    private async postWithErrorHandling(
        url: string,
        data: DrivenHuntBody | JoinHuntBody | InfrastructureBody,
        errorMessage: string
    ): Promise<{ success: true } | { success: false; errorCode?: number }> {
        const headers = await this.getRequestHeaders();
        headers["Content-Type"] = "application/json";
        try {
            const response = await fetch(this.baseUrl + url, {
                method: "POST",
                headers,
                body: JSON.stringify(data),
            });
            if (response.status === 200) {
                return { success: true };
            }

            if (response.status === 400) {
                const json = await response.json();
                logger.error({ errorMessage, json });
                if (json.code) {
                    return { success: false, errorCode: json.code };
                }
                return { success: false };
            }

            logger.error(`${errorMessage} - unexpected status`, response.status);
            return { success: false };
        } catch (error) {
            logger.error(`${errorMessage} - unexpected error`, error);
            return { success: false };
        }
    }

    public async joinHunt(data: JoinHuntBody): Promise<{ success: true } | { success: false; errorCode?: number }> {
        return this.postWithErrorHandling("/hunts/join", data, "Failed to join driven hunt");
    }

    public async addDrivenHunt(
        data: DrivenHuntBody
    ): Promise<{ success: true } | { success: false; errorCode?: number }> {
        return this.postWithErrorHandling("/hunts", data, "Failed to add driven hunt");
    }

    public async addIndividualHunt(
        data: IndividualHuntBody
    ): Promise<{ success: true } | { success: false; errorCode?: number }> {
        return this.postWithErrorHandling("/hunts", data, "Failed to add individual hunt");
    }

    public async approveOrRejectIndividualHunt(data: ApproveOrRejectIndividualHunt) {
        return this.request({
            method: "POST",
            path: "/hunts/individual/approval",
            body: data,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    public deleteProfile() {
        return this.request({ method: "DELETE", path: "/user/profile", schema: accountDeletionSchema });
    }

    public async postReport(
        report: Report,
        onProgress: (progress: number) => void
    ): Promise<
        { success: true; result?: ReportSyncResult } | { success: false; error: ReportSyncError; reason?: string }
    > {
        let headers: Record<string, string>;
        try {
            headers = await this.getRequestHeaders();
        } catch (error) {
            return Promise.resolve({
                success: false,
                error: { type: "other" },
                reason: "Failed to get request headers",
            });
        }

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();

            xhr.open("POST", this.baseUrl + "/applyEdits", true);

            xhr.timeout = configuration.reports.timeout;

            for (const [header, value] of Object.entries(headers)) {
                xhr.setRequestHeader(header, value);
            }
            xhr.setRequestHeader("Content-Type", "multipart/form-data");

            const formData = new FormData();
            formData.append("edits", JSON.stringify(report.edits));

            if (report.photo) {
                // @ts-expect-error RN handles files like this
                formData.append("files", getPhotoForFormData(report.photo));
            }

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress);
                }
            };

            xhr.onload = () => {
                const result = parsePostReportResponse(
                    xhr.status,
                    xhr.getResponseHeader("Content-Type")!,
                    xhr.responseText,
                    report.edits[0].id
                );
                resolve(result);
            };

            xhr.onerror = () => {
                resolve({ success: false, error: { type: "network" } });
            };

            xhr.ontimeout = () => {
                resolve({ success: false, error: { type: "timeout", timeout: xhr.timeout } });
            };

            xhr.send(formData);
        });
    }

    public async postHuntActivities(body: HuntActivitiesRequest) {
        return this.request({
            method: "POST",
            path: "/hunts/event-activities",
            body,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    public async postPushNotificationsToken(token: PushNotificationsToken) {
        return this.request({
            method: "POST",
            path: "/user/notification-tokens",
            headers: {
                "Content-Type": "application/json",
            },
            body: token,
        });
    }

    public getInfrastructure(): Promise<Infrastructure[]> {
        return this.request({ method: "GET", path: "/hunting-infrastructure", schema: infrastructuresSchema });
    }

    public getConfig(): Promise<Config> {
        return this.request({ method: "GET", path: "/configs", schema: configSchema });
    }

    public async deleteInfrastructure(id: number) {
        const headers = await this.getRequestHeaders();
        headers["Content-Type"] = "application/json";

        const response = await fetch(this.baseUrl + "/hunting-infrastructure", {
            method: "DELETE",
            headers,
            body: JSON.stringify({ id }),
        });

        if (![200, 404].includes(response.status)) {
            logger.error(
                `Unexpected response status when deleting hunting infrastructure with id ${id}, expected 200 or 404, got ${response.status}`,
                await response.text()
            );
            throw new Error("Unexpected response status");
        }
    }

    public async addInfrastructure(body: InfrastructureBody): Promise<{ id: number }> {
        const headers = await this.getRequestHeaders();
        headers["Content-Type"] = "application/json";

        const response = await fetch(this.baseUrl + "/hunting-infrastructure", {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        if (![200, 400].includes(response.status)) {
            logger.error(
                `Unexpected response status when creating or updating hunting infrastructure, expected 200 or 400, got ${response.status}`,
                await response.text()
            );
            throw new Error("Unexpected response content type");
        }

        const json = await response.json();

        if ("id" in json && typeof json.id === "number" && json.id > 0) {
            return { id: json.id };
        }

        logger.error("Missing id in response", json);
        throw new Error("Missing id in response");
    }
}

export const api = new Api(ENV.API_URL);
