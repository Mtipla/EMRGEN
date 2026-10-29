package com.emergen.mobile;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Base64;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

@CapacitorPlugin(name = "VolumeSos", permissions = {
    @Permission(alias = "location", strings = {Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}),
    @Permission(alias = "notifications", strings = {Manifest.permission.POST_NOTIFICATIONS})
})
public final class VolumeSosPlugin extends Plugin {
    @Override public void load() { VolumeSosRuntime.init(getContext()); VolumeSosRuntime.bind(this); }
    void emit(String event, JSObject value) {
        // Al volver a la app se consulta getStatus; no acumular eventos en una WebView suspendida.
        if (getActivity() != null && getActivity().hasWindowFocus()) notifyListeners(event, value);
    }
    @PluginMethod public void getStatus(PluginCall call) { call.resolve(VolumeSosRuntime.status()); }

    @PluginMethod public void syncSession(PluginCall call) {
        try {
            String token = call.getString("token", ""); int userId = call.getInt("userId", 0);
            String[] parts = token.split("\\.");
            if (parts.length != 3 || userId <= 0) throw new IllegalArgumentException("Inicia sesión de nuevo en EMERGEN.");
            JSONObject claims = new JSONObject(new String(Base64.decode(parts[1], Base64.URL_SAFE | Base64.NO_WRAP), StandardCharsets.UTF_8));
            if (claims.optInt("sub") != userId) throw new IllegalArgumentException("La sesión no corresponde al perfil.");
            long expiresAt = claims.getLong("exp") * 1000;
            if (expiresAt <= System.currentTimeMillis()) throw new IllegalArgumentException("La sesión venció. Vuelve a iniciar sesión.");
            JSONObject session = new JSONObject().put("token", token).put("userId", userId).put("expiresAt", expiresAt)
                .put("apiUrl", baseUrl(call.getString("apiUrl", ""))).put("internalApiUrl", baseUrl(call.getString("internalApiUrl", "")));
            boolean newUser = VolumeSosRuntime.store().session().optInt("userId") != userId;
            getActivity().runOnUiThread(() -> {
                try {
                    if (newUser) VolumeSosRuntime.disable();
                    VolumeSosRuntime.store().setSession(session); VolumeSosRuntime.changed(); call.resolve(VolumeSosRuntime.status());
                } catch (Exception error) { call.reject("No se pudo guardar la sesión nativa."); }
            });
        } catch (Exception error) {
            getActivity().runOnUiThread(() -> { VolumeSosRuntime.disable(); VolumeSosRuntime.store().clearSession(); VolumeSosRuntime.changed(); });
            call.reject(error instanceof IllegalArgumentException ? error.getMessage() : "La sesión nativa no es válida.");
        }
    }
    private String baseUrl(String value) throws Exception {
        java.net.URI uri = new java.net.URI(value);
        if (uri.getHost() == null || uri.getUserInfo() != null || uri.getQuery() != null || uri.getFragment() != null
            || !("https".equals(uri.getScheme()) || (BuildConfig.DEBUG && "http".equals(uri.getScheme())))
            || (uri.getPath() != null && !uri.getPath().isEmpty() && !uri.getPath().equals("/"))) {
            throw new IllegalArgumentException("La URL nativa de la API no es válida.");
        }
        return value.replaceAll("/+$", "");
    }
    @PluginMethod public void clearSession(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            VolumeSosRuntime.disable(); VolumeSosRuntime.endCapture(null); VolumeSosRuntime.store().clearSession();
            VolumeSosRuntime.changed(); call.resolve();
        });
    }
    @PluginMethod public void beginCapture(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (!getActivity().hasWindowFocus()) { call.reject("Mantén EMERGEN visible para grabar los botones físicos."); return; }
            String id = VolumeSosRuntime.beginCapture(); call.resolve(new JSObject().put("captureId", id));
        });
    }
    @PluginMethod public void endCapture(PluginCall call) {
        getActivity().runOnUiThread(() -> { VolumeSosRuntime.endCapture(call.getString("captureId")); call.resolve(); });
    }
    @PluginMethod public void saveSequence(PluginCall call) {
        try {
            JSArray keys = call.getArray("keys", new JSArray()); int[] sequence = new int[keys.length()];
            for (int i = 0; i < sequence.length; i++) {
                String key = keys.getString(i);
                sequence[i] = "UP".equals(key) ? VolumeSequenceMatcher.UP : "DOWN".equals(key) ? VolumeSequenceMatcher.DOWN : -1;
            }
            VolumeSosRuntime.store().saveSequence(sequence); VolumeSosRuntime.changed(); call.resolve(VolumeSosRuntime.status());
        } catch (Exception error) { call.reject("Usa de 3 a 12 pulsaciones físicas con volumen + y − y una sesión vigente."); }
    }
    @PluginMethod public void setEnabled(PluginCall call) {
        if (!Boolean.TRUE.equals(call.getBoolean("enabled", false))) {
            getActivity().runOnUiThread(() -> { VolumeSosRuntime.disable(); VolumeSosRuntime.changed(); call.resolve(VolumeSosRuntime.status()); }); return;
        }
        if (!VolumeSosRuntime.store().validSession()) { call.reject("La sesión venció. Cierra sesión y vuelve a ingresar."); return; }
        if (!VolumeSequenceMatcher.valid(VolumeSosRuntime.store().sequence())) { call.reject("Primero graba y comprueba tu secuencia."); return; }
        if (!VolumeSosRuntime.accessibilityEnabled() || VolumeSosRuntime.accessibility == null) {
            call.reject("Habilita EMERGEN en Accesibilidad y vuelve a pulsar Activar segundo plano."); return;
        }
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
            && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("location", call, "afterLocation"); return;
        }
        requestNotificationsThenStart(call);
    }
    @PermissionCallback private void afterLocation(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
            && ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Permite ubicación en Ajustes para iniciar el servicio. El SOS manual sigue disponible."); return;
        }
        requestNotificationsThenStart(call);
    }
    private void requestNotificationsThenStart(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "afterNotifications"); return;
        }
        start(call);
    }
    @PermissionCallback private void afterNotifications(PluginCall call) {
        if (getPermissionState("notifications") != PermissionState.GRANTED) { call.reject("Permite notificaciones de EMERGEN para ver cuándo está activa la detección y el resultado del SOS."); return; }
        start(call);
    }
    private void start(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                VolumeSosRuntime.endCapture(null);
                ContextCompat.startForegroundService(getContext(), new Intent(getContext(), VolumeSosForegroundService.class));
                call.resolve(VolumeSosRuntime.status());
            } catch (Exception error) { call.reject("No se pudo iniciar el servicio. Actívalo con EMERGEN abierta."); }
        });
    }
    @PluginMethod public void openAccessibilitySettings(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            getActivity().startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)); call.resolve();
        });
    }
    @PluginMethod public void openAppSettings(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            getActivity().startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()))); call.resolve();
        });
    }
}
