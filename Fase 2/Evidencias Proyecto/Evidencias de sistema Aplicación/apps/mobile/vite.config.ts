/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { androidLanUrls } from "../../scripts/android-lan-env.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const urls =
    mode === "android-lan"
      ? androidLanUrls(loadEnv(mode, "../../", "VITE_"))
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
                      version: "0.2.2",
                      builtAt: new Date().toISOString(),
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
