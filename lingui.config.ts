import { defineConfig } from "@lingui/cli";

export default defineConfig({
    locales: ["en", "zh"],
    sourceLocale: "en",
    fallbackLocales: { default: "en" },
    catalogs: [
        {
            path: "<rootDir>/locales/{locale}/messages",
            include: ["<rootDir>/app", "<rootDir>/components", "<rootDir>/lib"],
        },
    ],
    compileNamespace: "ts",
});
