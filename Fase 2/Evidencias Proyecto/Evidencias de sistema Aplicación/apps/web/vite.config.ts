import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { publicApiUrls } from "../../scripts/api-environment.mjs";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build")
    publicApiUrls(loadEnv(mode, "../../", "VITE_"), mode);
  return {
    plugins: [react()],
    // Un solo .env en la raíz del monorepo; Vite solo expone las variables VITE_*.
    envDir: "../../",
  };
});
