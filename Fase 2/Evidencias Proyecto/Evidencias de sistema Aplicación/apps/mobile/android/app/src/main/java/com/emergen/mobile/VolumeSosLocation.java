package com.emergen.mobile;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Looper;
import android.os.SystemClock;
import androidx.core.content.ContextCompat;
import androidx.core.location.LocationManagerCompat;
import com.getcapacitor.JSObject;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import java.util.Locale;

/** Proveedor fusionado como el SOS manual, con GPS/red como respaldo. No envía coordenadas al servidor. */
final class VolumeSosLocation implements LocationListener {
    private final Context context;
    private final LocationManager manager;
    private FusedLocationProviderClient fused;
    private volatile Location latest;
    private volatile boolean running;
    private final LocationCallback callback = new LocationCallback() {
        @Override public void onLocationResult(LocationResult result) {
            for (Location location : result.getLocations()) onLocationChanged(location);
        }
    };

    VolumeSosLocation(Context context) {
        this.context = context;
        manager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    }
    boolean permitted() {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            || ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    void start() {
        if (running) return;
        running = true;
        // Registrar incluso un proveedor temporalmente apagado permite recibirlo al volver a activar Ubicación.
        for (String provider : new String[]{LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER}) {
            try {
                if (manager.getAllProviders().contains(provider)) {
                    Location cached = manager.getLastKnownLocation(provider);
                    if (cached != null) onLocationChanged(cached);
                    manager.requestLocationUpdates(provider, 5000, 0, this, Looper.getMainLooper());
                }
            } catch (SecurityException | IllegalArgumentException ignored) { }
        }
        try {
            fused = LocationServices.getFusedLocationProviderClient(context);
            fused.getLastLocation().addOnSuccessListener(location -> { if (location != null) onLocationChanged(location); });
            LocationRequest request = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
                .setMinUpdateIntervalMillis(2000).setMaxUpdateDelayMillis(0).setWaitForAccurateLocation(false).build();
            fused.requestLocationUpdates(request, callback, Looper.getMainLooper())
                .addOnFailureListener(error -> VolumeSosRuntime.changed());
        } catch (Exception ignored) { /* GPS/red continúan sin Google Play Services. */ }
    }
    void stop() {
        running = false;
        if (fused != null) { try { fused.removeLocationUpdates(callback); } catch (Exception ignored) { } }
        try { manager.removeUpdates(this); } catch (SecurityException ignored) { }
        latest = null;
    }
    @Override public void onLocationChanged(Location location) {
        if (!running || !VolumeLocationPolicy.coordinates(location.getLatitude(), location.getLongitude())) return;
        if (latest == null || location.getElapsedRealtimeNanos() > latest.getElapsedRealtimeNanos()) {
            latest = new Location(location); VolumeSosRuntime.changed();
        }
    }
    @Override public void onProviderEnabled(String provider) { VolumeSosRuntime.changed(); }
    @Override public void onProviderDisabled(String provider) { VolumeSosRuntime.changed(); }
    @Override public void onStatusChanged(String provider, int status, Bundle extras) { }
    String recent() {
        Location location = latest;
        if (!permitted() || !LocationManagerCompat.isLocationEnabled(manager) || location == null
            || !VolumeLocationPolicy.recent(SystemClock.elapsedRealtimeNanos(), location.getElapsedRealtimeNanos())) return null;
        return String.format(Locale.US, "%.6f,%.6f", location.getLatitude(), location.getLongitude());
    }
    JSObject status() {
        Location location = latest;
        boolean allowed = permitted(), enabled = LocationManagerCompat.isLocationEnabled(manager), available = recent() != null;
        String message = !allowed ? "Permiso de ubicación pendiente."
            : !enabled ? "La ubicación del teléfono está apagada."
            : available ? "Ubicación reciente disponible para el SOS."
            : running ? "Buscando ubicación. Si aún no se obtiene, el SOS se enviará sin ella."
            : "Activa segundo plano para obtener ubicación.";
        return new JSObject().put("available", available).put("enabled", enabled).put("permitted", allowed)
            .put("ageMs", location == null ? -1 : Math.max(0, (SystemClock.elapsedRealtimeNanos() - location.getElapsedRealtimeNanos()) / 1_000_000))
            .put("accuracyMeters", location != null && location.hasAccuracy() ? (double) location.getAccuracy() : -1)
            .put("message", message);
    }
}
