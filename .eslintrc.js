const config = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    plugins: ["react", "react-native", "react-hooks"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        node: true,
    },
    rules: {
        "react-native/no-unused-styles": "error",
        "react-native/split-platform-components": "error",
        "react-native/no-inline-styles": "error",
        "react-native/no-color-literals": "error",
        "react-native/no-single-element-style-arrays": "error",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        // object = { x } instead of { x: x }
        "object-shorthand": "error",
        // Type[] instead of Array<Type>
        "@typescript-eslint/array-type": [
            "error",
            {
                default: "array-simple",
            },
        ],
        // Use raw text only in Text and TimberText components
        "react-native/no-raw-text": "error",
        // Use curly braces around blocks
        curly: "error",
        // `function something() {}` instead of `const something = () => {}`
        "func-style": ["error", "declaration"],
    },
    overrides: [
        {
            files: ["*.test.{js,ts,tsx}"],
            env: {
                jest: true,
            },
        },
    ],
};

module.exports = config;
