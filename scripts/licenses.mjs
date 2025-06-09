import fs from "node:fs/promises";
import path from "node:path";

const EXPO_LICENSE = `
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
const EXPO_GOOGLE_FONTS_LICENSE = `
MIT License

Copyright (c) 2020 Expo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const defaultLicenses = new Map();
defaultLicenses.set("@expo-google-fonts/ibm-plex-sans", EXPO_GOOGLE_FONTS_LICENSE);
defaultLicenses.set("expo-auth-session", EXPO_LICENSE);
defaultLicenses.set("expo-build-properties", EXPO_LICENSE);
defaultLicenses.set("expo-camera", EXPO_LICENSE);
defaultLicenses.set("expo-constants", EXPO_LICENSE);
defaultLicenses.set("expo-crypto", EXPO_LICENSE);
defaultLicenses.set("expo-dev-client", EXPO_LICENSE);
defaultLicenses.set("expo-device", EXPO_LICENSE);
defaultLicenses.set("expo-file-system", EXPO_LICENSE);
defaultLicenses.set("expo-font", EXPO_LICENSE);
defaultLicenses.set("expo-image-picker", EXPO_LICENSE);
defaultLicenses.set("expo-keep-awake", EXPO_LICENSE);
defaultLicenses.set("expo-linking", EXPO_LICENSE);
defaultLicenses.set("expo-location", EXPO_LICENSE);
defaultLicenses.set("expo-notifications", EXPO_LICENSE);
defaultLicenses.set("expo-secure-store", EXPO_LICENSE);
defaultLicenses.set("expo-sharing", EXPO_LICENSE);
defaultLicenses.set("expo-splash-screen", EXPO_LICENSE);
defaultLicenses.set("expo-sqlite", EXPO_LICENSE);
defaultLicenses.set("expo-status-bar", EXPO_LICENSE);
defaultLicenses.set("expo-system-ui", EXPO_LICENSE);
defaultLicenses.set("expo-web-browser", EXPO_LICENSE);
defaultLicenses.set("expo", EXPO_LICENSE);

const packageJson = JSON.parse(await fs.readFile("package.json"));
const dependencies = Object.keys(packageJson.dependencies);

const licenses = [];

for (const dependency of dependencies) {
    const dependencyPath = path.join("node_modules", dependency);
    const dependencyPathFiles = await fs.readdir(dependencyPath);
    const licenseFilename = dependencyPathFiles.find((file) => file.toLowerCase().includes("license"));
    if (licenseFilename) {
        const license = await fs.readFile(path.join(dependencyPath, licenseFilename), { encoding: "utf-8" });
        licenses.push({ dependency, license: license.trim() });
        continue;
    }

    const defaultLicense = defaultLicenses.get(dependency);
    if (defaultLicense) {
        licenses.push({ dependency, license: defaultLicense.trim() });
        continue;
    }

    console.error(`Missing license for dependency ${dependency}`);
}

await fs.writeFile("licenses.json", JSON.stringify(licenses, null, 4) + "\n", { encoding: "utf-8" });
