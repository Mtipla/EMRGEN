/** La simulación solo se admite en desarrollo y queda identificada en el mensaje. */
export async function obtenerUbicacionSos(
  onUnavailable?: (reason: string) => void,
): Promise<string | undefined> {
  const simulated = import.meta.env.DEV && import.meta.env.VITE_SOS_SIMULATED_LOCATION;
  if (simulated) {
    const parts = String(simulated).split(',');
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
  if (!navigator.geolocation) {
    onUnavailable?.('Este navegador no ofrece acceso a la ubicación.');
    return undefined;
  }
  return new Promise((resolve) => {
    const timeoutMessage =
      'No se obtuvo una ubicación en 10 segundos. Comprueba la ubicación del dispositivo y la conexión.';
    let completed = false;
    // También limita la espera mientras el navegador solicita el permiso.
    const timer = setTimeout(() => finish(undefined, timeoutMessage), 10_000);
    const finish = (value?: string, reason?: string) => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      if (reason) onUnavailable?.(reason);
      resolve(value);
    };
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => finish(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`),
        (error) => {
          const messages: Record<number, string> = {
            1: 'El acceso a la ubicación está bloqueado. Revisa los permisos del navegador y del dispositivo.',
            2: 'El dispositivo no pudo determinar tu ubicación. Comprueba que la ubicación esté activada.',
            3: timeoutMessage,
          };
          finish(
            undefined,
            messages[error?.code] ?? 'No se pudo obtener la ubicación del dispositivo.',
          );
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
      );
    } catch {
      finish(
        undefined,
        'No se pudo solicitar la ubicación. Revisa los permisos del navegador y del dispositivo.',
      );
    }
  });
}
