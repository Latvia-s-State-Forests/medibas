import { ExpoConfig } from "expo/config";

const VERSION = "3.3.0";
const IOS_BUILD_NUMBER = "7";
const ANDROID_VERSION_CODE = 1527;

export default (): ExpoConfig => {
    const config: ExpoConfig = {
        name: "Mednis Dev",
        slug: "mednis-dev",
        owner: "mednis",
        version: VERSION,
        orientation: "default",
        userInterfaceStyle: "light",
        assetBundlePatterns: ["**/*"],
        icon: "./assets/icon-ios-dev.png",
        newArchEnabled: false,
        ios: {
            bundleIdentifier: "app.mednis.dev",
            buildNumber: IOS_BUILD_NUMBER,
            infoPlist: {
                LSApplicationQueriesSchemes: ["waze", "comgooglemaps", "maps", "here-route"],
            },
            config: {
                usesNonExemptEncryption: false,
            },
            privacyManifests: {
                // https://docs.expo.dev/guides/apple-privacy/
                // https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api
                NSPrivacyAccessedAPITypes: [
                    {
                        NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
                        NSPrivacyAccessedAPITypeReasons: ["E174.1"],
                    },
                    {
                        NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategorySystemBootTime",
                        NSPrivacyAccessedAPITypeReasons: ["35F9.1"],
                    },
                    {
                        NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
                        NSPrivacyAccessedAPITypeReasons: ["C617.1"],
                    },
                    {
                        NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
                        NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
                    },
                ],
            },
        },
        android: {
            package: "app.mednis.dev",
            versionCode: ANDROID_VERSION_CODE,
            adaptiveIcon: {
                foregroundImage: "./assets/icon-android-dev.png",
                backgroundColor: "#FFFFFF",
            },
            softwareKeyboardLayoutMode: "pan",
            googleServicesFile: "./google-services-dev.json",
            edgeToEdgeEnabled: true,
            blockedPermissions: [
                "android.permission.READ_MEDIA_IMAGES",
                "android.permission.READ_MEDIA_VIDEO",
                "android.permission.READ_MEDIA_AUDIO",
                "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
            ],
        },
        scheme: ["app.mednis.dev", "app.mednis.test", "app.mednis.beta", "lv.mezaipasnieki.mednis"],
        extra: {
            eas: {
                projectId: "",
            },
        },
        plugins: [
            "expo-font",
            "expo-sqlite",
            "expo-secure-store",
            [
                "expo-splash-screen",
                {
                    backgroundColor: "#1f2021",
                    image: "./assets/splash-icon.png",
                    imageWidth: 256,
                },
            ],
            [
                "expo-location",
                {
                    locationWhenInUsePermission:
                        "Allow access to location to display your location on map or attach it to reports. You can always change this later in Settings app.",
                },
            ],
            [
                "expo-image-picker",
                {
                    photosPermission:
                        "Allow access to photos to attach photos from your library to reports. You can always change this later in Settings app.",
                    cameraPermission:
                        "Allow access to camera to take photos and attach them to reports. You can always change this later in Settings app.",
                },
            ],
            [
                "expo-camera",
                {
                    cameraPermission:
                        "Allow access to camera to take photos and attach them to reports. You can always change this later in Settings app.",
                },
            ],
            [
                "expo-media-library",
                {
                    savePhotosPermission:
                        "Allow access to save captured photos. You can always change this later in Settings app.",
                },
            ],
            [
                "expo-build-properties",
                {
                    android: {
                        minSdkVersion: 26, // Android 8.0+
                    },
                    ios: {
                        deploymentTarget: "15.7", // iOS 15.7+
                    },
                },
            ],
            [
                "expo-notifications",
                {
                    icon: "./assets/notifications-icon.png",
                    color: "#606c38",
                    defaultChannel: "news",
                },
            ],
        ],
    };

    if (process.env.EXPO_PUBLIC_APP_VARIANT === "test") {
        config.name = "Mednis Test";
        config.slug = "mednis-test";
        config.icon = "./assets/icon-ios-test.png";
        config.orientation = "portrait";
        config.ios!.bundleIdentifier = "app.mednis.test";
        config.android!.package = "app.mednis.test";
        config.android!.adaptiveIcon!.foregroundImage = "./assets/icon-android-test.png";
        config.android!.googleServicesFile = "./google-services-test.json";
        config.scheme = "app.mednis.test";
        config.extra!.eas!.projectId = "";
    } else if (process.env.EXPO_PUBLIC_APP_VARIANT === "beta") {
        config.name = "Mednis Beta";
        config.slug = "mednis-beta";
        config.icon = "./assets/icon-ios-beta.png";
        config.orientation = "portrait";
        config.ios!.bundleIdentifier = "app.mednis.beta";
        config.android!.package = "app.mednis.beta";
        config.android!.adaptiveIcon!.foregroundImage = "./assets/icon-android-beta.png";
        config.android!.googleServicesFile = "./google-services-beta.json";
        config.scheme = ["app.mednis.beta", "lv.mezaipasnieki.mednis"];
        config.extra!.eas!.projectId = "";
    } else if (process.env.EXPO_PUBLIC_APP_VARIANT === "production") {
        config.name = "Mednis";
        config.slug = "mednis";
        config.icon = "./assets/icon-ios.png";
        config.orientation = "portrait";
        config.ios!.bundleIdentifier = "lv.mezaipasnieki.mednis";
        config.android!.package = "lv.mezaipasnieki.mednis";
        config.android!.adaptiveIcon!.foregroundImage = "./assets/icon-android.png";
        config.android!.googleServicesFile = "./google-services-prod.json";
        config.scheme = "lv.mezaipasnieki.mednis";
        config.extra!.eas!.projectId = "";
    }

    return config;
};
