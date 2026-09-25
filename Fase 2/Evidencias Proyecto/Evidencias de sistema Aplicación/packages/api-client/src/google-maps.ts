import type { GeoPoint } from '@repo/api-types';
import { loadScript } from './load-script';

/*
 * Tipos mínimos de la Maps JavaScript API, solo lo que usa este módulo.
 * Si más adelante se necesita la API completa, instalar @types/google.maps.
 */
export interface GoogleMap {
  setCenter(position: GeoPoint): void;
  setZoom(zoom: number): void;
}

export interface GoogleMarker {
  map: GoogleMap | null;
  position: GeoPoint | null;
}

interface MapsLibrary {
  Map: new (
    container: HTMLElement,
    options: { center: GeoPoint; zoom: number; mapId: string },
  ) => GoogleMap;
}

interface MarkerLibrary {
  AdvancedMarkerElement: new (options: {
    map: GoogleMap;
    position: GeoPoint;
    title?: string;
  }) => GoogleMarker;
}

interface GoogleMapsNamespace {
  importLibrary(name: 'maps'): Promise<MapsLibrary>;
  importLibrary(name: 'marker'): Promise<MarkerLibrary>;
}

export interface CreateMapOptions {
  /** Key de NAVEGADOR (restringida por dominio), normalmente `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`. */
  apiKey: string;
  center: GeoPoint;
  zoom?: number;
  /** Map ID de Google Cloud; obligatorio para marcadores avanzados. "DEMO_MAP_ID" sirve para desarrollo. */
  mapId?: string;
}

/** Centro de Santiago de Chile, útil como posición por defecto. */
export const SANTIAGO: GeoPoint = { lat: -33.4489, lng: -70.6693 };

/** Carga la Maps JavaScript API una sola vez y devuelve el namespace `google.maps`. */
export async function loadGoogleMaps(apiKey: string): Promise<GoogleMapsNamespace> {
  const params = new URLSearchParams({ key: apiKey, v: 'weekly', loading: 'async' });
  await loadScript(`https://maps.googleapis.com/maps/api/js?${params}`);

  const maps = (window as unknown as { google?: { maps?: GoogleMapsNamespace } }).google?.maps;
  if (!maps) throw new Error('Google Maps no se inicializó: revisa VITE_GOOGLE_MAPS_API_KEY.');
  // Con loading=async, importLibrary puede no estar listo justo en el evento load.
  await waitFor(() => typeof maps.importLibrary === 'function');
  return maps;
}

/** Crea un mapa dentro de `container`. */
export async function createMap(container: HTMLElement, options: CreateMapOptions): Promise<GoogleMap> {
  const maps = await loadGoogleMaps(options.apiKey);
  const { Map } = await maps.importLibrary('maps');
  return new Map(container, {
    center: options.center,
    zoom: options.zoom ?? 14,
    mapId: options.mapId ?? 'DEMO_MAP_ID',
  });
}

/** Agrega un marcador al mapa (ej. la ubicación de una alerta). */
export async function addMarker(
  apiKey: string,
  map: GoogleMap,
  position: GeoPoint,
  title?: string,
): Promise<GoogleMarker> {
  const maps = await loadGoogleMaps(apiKey);
  const { AdvancedMarkerElement } = await maps.importLibrary('marker');
  return new AdvancedMarkerElement({ map, position, title });
}

async function waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error('Tiempo de espera agotado cargando Google Maps.');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
