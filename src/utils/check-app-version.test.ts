import { AppUpdateStatus } from "~/types/versions";
import { checkAppVersion } from "./check-app-version";

describe("checkAppVersion", () => {
    it("Failed when current version is invalid", () => {
        const currentVersion = "invalidVersion";
        const availableVersions = ["1.0.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.Failed);
    });

    it("Failed when isCurrentVersionAvailable=false, isNewerVersionAvailable=false, isOlderVersionAvailable=false", () => {
        const currentVersion = "1.0.0";
        const availableVersions: string[] = [];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.Failed);
    });

    it("UpToDate when isCurrentVersionAvailable=false, isNewerVersionAvailable=false, isOlderVersionAvailable=true", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["0.9.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.UpToDate);
    });

    it("Mandatory when isCurrentVersionAvailable=false, isNewerVersionAvailable=true, isOlderVersionAvailable=false", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["1.1.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.Mandatory);
    });

    it("Mandatory when isCurrentVersionAvailable=false, isNewerVersionAvailable=true, isOlderVersionAvailable=true", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["0.9.0", "1.1.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.Mandatory);
    });

    it("UpToDate when isCurrentVersionAvailable=true, isNewerVersionAvailable=false, isOlderVersionAvailable=false", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["1.0.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.UpToDate);
    });

    it("UpToDate when isCurrentVersionAvailable=true, isNewerVersionAvailable=false, isOlderVersionAvailable=true", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["0.9.0", "1.0.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.UpToDate);
    });

    it("Optional when isCurrentVersionAvailable=true, isNewerVersionAvailable=true, isOlderVersionAvailable=false", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["1.0.0", "1.1.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.Optional);
    });

    it("Optional when isCurrentVersionAvailable=true, isNewerVersionAvailable=true, isOlderVersionAvailable=true", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["0.9.0", "1.0.0", "1.1.0"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.Optional);
    });

    it("ignores invalid available version", () => {
        const currentVersion = "1.0.0";
        const availableVersions = ["1.0.0", "invalidVersion"];
        const result = checkAppVersion(currentVersion, availableVersions);
        expect(result).toBe(AppUpdateStatus.UpToDate);
    });
});
