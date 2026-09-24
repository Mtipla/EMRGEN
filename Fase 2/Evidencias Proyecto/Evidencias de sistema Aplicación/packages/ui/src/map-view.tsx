import { useEffect, useRef, useState, type CSSProperties } from "react";
import { addMarker, createMap, type GeoPoint, type GoogleMarker } from "@repo/api-client";

interface MapViewProps {
  /** Key de navegador de Google Maps (VITE_GOOGLE_MAPS_API_KEY). */
  apiKey: string;
  center: GeoPoint;
  /** Marcadores a dibujar (ej. ubicaciones de alertas). */
  markers?: Array<GeoPoint & { title?: string }>;
  zoom?: number;
  mapId?: string;
  style?: CSSProperties;
}

export const MapView = ({ apiKey, center, markers = [], zoom, mapId, style }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();
  // Dependencias por valor: el mapa no se recrea si el padre pasa objetos nuevos con los mismos datos.
  const centerKey = JSON.stringify(center);
  const markersKey = JSON.stringify(markers);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const created: GoogleMarker[] = [];
    (async () => {
      const map = await createMap(container, { apiKey, center: JSON.parse(centerKey) as GeoPoint, zoom, mapId });
      for (const { title, ...position } of JSON.parse(markersKey) as NonNullable<MapViewProps["markers"]>) {
        if (cancelled) return;
        created.push(await addMarker(apiKey, map, position, title));
      }
    })().catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : String(err));
    });

    return () => {
      cancelled = true;
      created.forEach((marker) => (marker.map = null));
    };
  }, [apiKey, centerKey, markersKey, zoom, mapId]);

  if (error) return <p role="alert">No se pudo cargar el mapa: {error}</p>;
  return <div ref={containerRef} style={{ width: "100%", height: 400, ...style }} />;
};
