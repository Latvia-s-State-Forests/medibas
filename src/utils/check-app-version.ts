import semver from "semver";
import { match } from "ts-pattern";
import { AppUpdateStatus } from "~/types/versions";

export function checkAppVersion(currentVersion: string, availableVersions: string[]): AppUpdateStatus {
    if (!semver.valid(currentVersion)) {
        return AppUpdateStatus.Failed;
    }

    let isCurrentVersionAvailable = false;
    let isNewerVersionAvailable = false;
    let isOlderVersionAvailable = false;

    for (const version of availableVersions) {
        if (!semver.valid(version)) {
            continue;
        }

        if (semver.eq(currentVersion, version)) {
            isCurrentVersionAvailable = true;
        }

        if (semver.gt(version, currentVersion)) {
            isNewerVersionAvailable = true;
        }

        if (semver.lt(version, currentVersion)) {
            isOlderVersionAvailable = true;
        }
    }

    return match([isCurrentVersionAvailable, isNewerVersionAvailable, isOlderVersionAvailable])
        .with([false, false, false], () => AppUpdateStatus.Failed)
        .with([false, false, true], () => AppUpdateStatus.UpToDate)
        .with([false, true, false], () => AppUpdateStatus.Mandatory)
        .with([false, true, true], () => AppUpdateStatus.Mandatory)
        .with([true, false, false], () => AppUpdateStatus.UpToDate)
        .with([true, false, true], () => AppUpdateStatus.UpToDate)
        .with([true, true, false], () => AppUpdateStatus.Optional)
        .with([true, true, true], () => AppUpdateStatus.Optional)
        .exhaustive();
}
