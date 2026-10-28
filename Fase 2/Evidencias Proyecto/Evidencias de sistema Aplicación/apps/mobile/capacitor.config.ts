import type { CapacitorConfig } from "@capacitor/cli";

// Identidad provisional estable para las pruebas del equipo. No carga .env ni un servidor Vite.
const config: CapacitorConfig = {
  appId: "com.emergen.mobile",
  appName: "EMERGEN",
  webDir: "dist",
  server: {
    hostname: "localhost",
    androidScheme: "https",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
