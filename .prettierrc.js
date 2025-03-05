/** @type {import("prettier").Config} */
module.exports = {
    tabWidth: 4,
    printWidth: 120,
    trailingComma: "es5",
    plugins: ["@trivago/prettier-plugin-sort-imports"],
    importOrder: ["^intl-pluralrules$", "<THIRD_PARTY_MODULES>", "^[./]"],
};
