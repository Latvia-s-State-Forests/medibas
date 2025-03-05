/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    preset: "jest-expo",
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
    ],
    collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
    coverageReporters: ["text", "lcov", "cobertura"],
    reporters: [
        "default",
        [
            "jest-junit",
            {
                outputDirectory: "coverage",
                suiteNameTemplate: "{filepath}",
                classNameTemplate: "{classname}",
            },
        ],
    ],
    setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
};

module.exports = config;
