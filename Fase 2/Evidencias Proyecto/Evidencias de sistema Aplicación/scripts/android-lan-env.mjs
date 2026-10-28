import { isIP } from "node:net";

/** Evita empaquetar silenciosamente localhost, valores de ejemplo o una API sin configurar. */
export function androidLanUrls(env) {
  const urls = {};
  for (const key of ["VITE_API_URL", "VITE_INTERNAL_API_URL"]) {
    let url;
    try {
      url = new URL(env[key]);
    } catch {
      throw new Error(
        `${key}: define una URL LAN en .env.android-lan.local de la raíz.`,
      );
    }
    const octets = url.hostname.split(".").map(Number);
    const privateIpv4 =
      isIP(url.hostname) === 4 &&
      (octets[0] === 10 ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168));
    if (
      !["http:", "https:"].includes(url.protocol) ||
      !privateIpv4 ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    ) {
      throw new Error(
        `${key}: usa http(s)://IPv4-privada:puerto, sin credenciales ni rutas. localhost no es LAN.`,
      );
    }
    urls[key] = url.origin;
  }
  if (env.VITE_SOS_SIMULATED_LOCATION?.trim()) {
    throw new Error(
      "Quita VITE_SOS_SIMULATED_LOCATION del entorno LAN: esta prueba utiliza ubicación real.",
    );
  }
  return urls;
}
