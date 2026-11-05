import {
  Capacitor,
  registerPlugin,
  type PluginListenerHandle,
} from "@capacitor/core";

export type VolumeKey = "UP" | "DOWN";
export type VolumeLocationState = {
  available: boolean;
  enabled: boolean;
  permitted: boolean;
  ageMs: number;
  accuracyMeters: number;
  message: string;
};
export type VolumeSosState = {
  enabled: boolean;
  recovering: boolean;
  location: VolumeLocationState;
  accessibilityEnabled: boolean;
  accessibilityConnected: boolean;
  authorized: boolean;
  expiresAt: number;
  sequence: VolumeKey[];
  captureId: string;
  lastResult: { message: string; alertId: number };
};
export type VolumeCapture = {
  captureId: string;
  keys: VolumeKey[];
  gap: boolean;
  overflow: boolean;
};
interface VolumeSosPlugin {
  getStatus(): Promise<VolumeSosState>;
  syncSession(options: {
    token: string;
    userId: number;
    apiUrl: string;
    internalApiUrl: string;
  }): Promise<VolumeSosState>;
  clearSession(): Promise<void>;
  beginCapture(): Promise<{ captureId: string }>;
  endCapture(options: { captureId: string }): Promise<void>;
  saveSequence(options: { keys: VolumeKey[] }): Promise<VolumeSosState>;
  setEnabled(options: { enabled: boolean }): Promise<VolumeSosState>;
  openAccessibilitySettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  addListener(
    event: "volumeKey",
    listener: (event: VolumeCapture) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    event: "stateChanged",
    listener: (state: VolumeSosState) => void,
  ): Promise<PluginListenerHandle>;
}
export const volumeSos = registerPlugin<VolumeSosPlugin>("VolumeSos");
export const volumenAndroid = () => Capacitor.getPlatform() === "android";
export const etiquetaVolumen = (key: VolumeKey) =>
  key === "UP" ? "Volumen +" : "Volumen −";
export const secuenciaValida = (keys: VolumeKey[]) =>
  keys.length >= 3 &&
  keys.length <= 12 &&
  keys.includes("UP") &&
  keys.includes("DOWN");

export async function sincronizarSesionNativa(
  user: { usuario_ID: number; requiere_pin: boolean } | null,
  token?: string | null,
) {
  if (!volumenAndroid()) return;
  if (!user || user.requiere_pin || !token) {
    await volumeSos.clearSession();
    return;
  }
  return volumeSos.syncSession({
    userId: user.usuario_ID,
    token,
    apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    internalApiUrl:
      import.meta.env.VITE_INTERNAL_API_URL ?? "http://localhost:8000",
  });
}
