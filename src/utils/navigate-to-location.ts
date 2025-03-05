import { Linking, Platform } from "react-native";

export async function onNavigate(
    latitude: number,
    longitude: number,
    locationLabel: string,
    setAvailableApps: (apps: Array<{ name: string; link: string }>) => void,
    setAvailableAppsDialogVisible: (visible: boolean) => void,
    setFailureDialogVisible: (visible: boolean) => void
) {
    const latLngText = `${latitude},${longitude}`;

    if (Platform.OS === "android") {
        const androidUrl = `geo:${latLngText}?q=${latLngText}`;
        const canOpenAndroidUrl = await Linking.canOpenURL(androidUrl);
        Linking.openURL(androidUrl);

        if (canOpenAndroidUrl) {
            Linking.openURL(androidUrl);
        } else {
            console.error("Google Maps is not available or disabled.");
            setFailureDialogVisible(true);
        }

        return;
    } else if (Platform.OS === "ios") {
        const apps = await getAvailableNavigationApps();
        setAvailableApps(apps);
        if (apps.length === 1) {
            const singleAppUrl = getNavigationUrl(apps[0].link, latLngText, locationLabel);
            setAvailableAppsDialogVisible(false);
            Linking.openURL(singleAppUrl);
        } else {
            setAvailableAppsDialogVisible(true);
        }
    }
}

export function onAppSelect(
    appName: string,
    availableApps: Array<{ name: string; link: string }>,
    latitude: number,
    longitude: number,
    locationLabel: string,
    setAvailableAppsDialogVisible: (visible: boolean) => void
) {
    const selectedApp = availableApps.find((app) => app.name === appName);
    if (selectedApp?.link) {
        const navigationLink = getNavigationUrl(selectedApp.link, `${latitude},${longitude}`, locationLabel);
        if (navigationLink) {
            Linking.openURL(navigationLink);
        }
    }
    setAvailableAppsDialogVisible(false);
}

async function getAvailableNavigationApps() {
    const mapApps = [
        { link: "comgooglemaps://", name: "Google Maps" },
        { link: "waze://", name: "Waze" },
        { link: "maps://", name: "Apple Maps" },
        { link: "here-route://", name: "Here Route" },
    ];
    const availableApps = [];

    for await (const app of mapApps) {
        const isAvailable = await isAppAvailable(app.link);
        if (isAvailable) {
            availableApps.push(app);
        }
    }
    return availableApps.sort((a, b) => (a.name === "Waze" ? -1 : b.name === "Waze" ? 1 : 0));
}

function isAppAvailable(link: string) {
    return new Promise((resolve) => {
        Linking.canOpenURL(link)
            .then((isAvailable) => {
                resolve(isAvailable);
            })
            .catch((error) => {
                console.error("Error while checking app availability", error);
                resolve(false);
            });
    });
}

function getNavigationUrl(link: string, latLngText: string, locationLabel: string) {
    switch (link) {
        case "comgooglemaps://":
            return `https://www.google.com/maps/search/?api=1&query=${latLngText}`;
        case "waze://":
            return `https://waze.com/ul?ll=${latLngText}&navigate=yes`;
        case "maps://":
            return `maps://?ll=${latLngText}&q=${locationLabel}`;
        case "here-route://":
            return `https://share.here.com/l/${latLngText}?z=13&p=yes`;
        default:
            return "";
    }
}
