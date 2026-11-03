import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type PreviewServer, type ViteDevServer } from "vite";
import { publicApiUrls } from "../../scripts/api-environment.mjs";

function configureApkDownload(server: ViteDevServer | PreviewServer) {
  server.middlewares.use((request, response, next) => {
    if (request.url?.split("?")[0] === "/downloads/emergen.apk") {
      response.setHeader("Content-Type", "application/vnd.android.package-archive");
      response.setHeader("Content-Disposition", 'attachment; filename="EMERGEN.apk"');
      response.setHeader("Cache-Control", "no-store");
    }
    next();
  });
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build")
    publicApiUrls((mode === "security-check" ? process.env : loadEnv(mode, "../../", "VITE_")), mode);
  return {
    plugins: [
      react(),
      {
        name: "emergen-apk-download",
        configureServer: configureApkDownload,
        configurePreviewServer: configureApkDownload,
      },
    ],
    // Un solo .env en la raíz del monorepo; Vite solo expone las variables VITE_*.
    envDir: mode === "security-check" ? false : "../../",
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
    },
  };
});
