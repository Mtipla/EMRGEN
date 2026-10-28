import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

const TIMEOUT_MESSAGE =
  "No se obtuvo una ubicación en 10 segundos. Comprueba la ubicación del dispositivo y la conexión.";

function errorNativo(cause: unknown): string {
  const code = (cause as { code?: string } | null)?.code;
  if (code === "OS-PLUG-GLOC-0003" || code === "OS-PLUG-GLOC-0008") {
    return "El acceso a la ubicación está bloqueado. Revisa los permisos de EMERGEN en Ajustes del dispositivo.";
  }
  if (
    ["OS-PLUG-GLOC-0007", "OS-PLUG-GLOC-0009", "OS-PLUG-GLOC-0017"].includes(
      code ?? "",
    )
  ) {
    return "La ubicación del dispositivo está desactivada. Actívala en Ajustes para incluirla en el SOS.";
  }
  if (code === "OS-PLUG-GLOC-0010") return TIMEOUT_MESSAGE;
  return "El dispositivo no pudo determinar tu ubicación. Comprueba la ubicación y los servicios de Google Play.";
}

/** Android usa permisos nativos; web conserva navigator. La espera total incluye el diálogo de permiso. */
export async function obtenerUbicacionSos(
  onUnavailable?: (reason: string) => void,
): Promise<string | undefined> {
  const simulated =
    import.meta.env.DEV && import.meta.env.VITE_SOS_SIMULATED_LOCATION;
  if (simulated) {
    const parts = String(simulated).split(",");
    const [lat, lng] = parts.map(Number);
    if (
      parts.length === 2 &&
      parts.every((part) => part.trim()) &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    ) {
      return `SIMULADA: ${lat},${lng}`;
    }
  }
  const android = Capacitor.getPlatform() === "android";
  if (!android && !navigator.geolocation) {
    onUnavailable?.("Este navegador no ofrece acceso a la ubicación.");
    return undefined;
  }
  return new Promise((resolve) => {
    let completed = false;
    // También limita la espera mientras el navegador solicita el permiso.
    const timer = setTimeout(() => finish(undefined, TIMEOUT_MESSAGE), 10_000);
    const finish = (value?: string, reason?: string) => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      if (reason) onUnavailable?.(reason);
      resolve(value);
    };
    if (android) {
      void (async () => {
        try {
          let permissions = await Geolocation.checkPermissions();
          if (completed) return;
          const granted = () =>
            permissions.location === "granted" ||
            permissions.coarseLocation === "granted";
          if (
            !granted() &&
            (permissions.location === "prompt" ||
              permissions.location === "prompt-with-rationale")
          ) {
            permissions = await Geolocation.requestPermissions({
              permissions: ["location"],
            });
          }
          if (completed) return;
          if (!granted()) {
            finish(undefined, errorNativo({ code: "OS-PLUG-GLOC-0003" }));
            return;
          }
          // Android puede conceder solo aproximada: el plugin respeta esa decisión.
          const { coords } = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10_000,
            maximumAge: 30_000,
          });
          if (
            !Number.isFinite(coords.latitude) ||
            !Number.isFinite(coords.longitude) ||
            Math.abs(coords.latitude) > 90 ||
            Math.abs(coords.longitude) > 180
          ) {
            throw new Error("Coordenadas inválidas del proveedor");
          }
          finish(
            `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`,
          );
        } catch (cause) {
          finish(undefined, errorNativo(cause));
        }
      })();
      return;
    }
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) =>
          finish(
            `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`,
          ),
        (error) => {
          const messages: Record<number, string> = {
            1: "El acceso a la ubicación está bloqueado. Revisa los permisos del navegador y del dispositivo.",
            2: "El dispositivo no pudo determinar tu ubicación. Comprueba que la ubicación esté activada.",
            3: TIMEOUT_MESSAGE,
          };
          finish(
            undefined,
            messages[error?.code] ??
              "No se pudo obtener la ubicación del dispositivo.",
          );
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
      );
    } catch {
      finish(
        undefined,
        "No se pudo solicitar la ubicación. Revisa los permisos del navegador y del dispositivo.",
      );
    }
  });
}
