/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { publicApiUrls } from "../../scripts/api-environment.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const urls =
    command === "build"
      ? publicApiUrls(loadEnv(mode, "../../", "VITE_"), mode)
      : undefined;
  return {
    plugins: [
      react(),
      legacy(),
      ...(urls
        ? [
            {
              name: "emergen-android-build",
              generateBundle() {
                this.emitFile({
                  type: "asset",
                  fileName: "android-build.json",
                  source: JSON.stringify(
                    {
                      mode,
                      version: "0.2.3",
                      builtAt: new Date().toISOString(),
                      deployment:
                        loadEnv(mode, "../../", "VITE_").VITE_DEPLOYMENT_ID ||
                        "local",
                      ...urls,
                    },
                    null,
                    2,
                  ),
                });
              },
            } satisfies Plugin,
          ]
        : []),
    ],
    // Un solo .env en la raíz del monorepo; Vite solo expone las variables VITE_*.
    envDir: "../../",
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
    },
  };
});
