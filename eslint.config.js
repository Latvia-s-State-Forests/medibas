// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const tseslint = require("typescript-eslint");
const reactNative = require("eslint-plugin-react-native");

module.exports = defineConfig([
    expoConfig,
    {
        plugins: {
            "react-native": reactNative,
            "@typescript-eslint": tseslint.plugin,
        },
        ignores: ["dist/*"],
        rules: {
            "react-native/no-unused-styles": "error",
            "react-native/split-platform-components": "error",
            "react-native/no-inline-styles": "error",
            "react-native/no-color-literals": "error",
            "react-native/no-single-element-style-arrays": "error",
            // Use raw text only in Text components
            "react-native/no-raw-text": "error",
            // Use object = { x } instead of { x: x }
            "object-shorthand": "error",
            // Use Type[] or Array<Type> when appropriate
            "@typescript-eslint/array-type": [
                "error",
                {
                    default: "array-simple",
                },
            ],
            // Use curly braces around blocks
            curly: "error",
            // Use `function something() {}` instead of `const something = () => {}`
            "func-style": ["error", "declaration"],
        },
    },
]);
