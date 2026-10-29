package com.emergen.mobile;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.KeyEvent;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.UUID;

/** Estado compartido nativo. La WebView no interviene en el reconocimiento o el envío. */
final class VolumeSosRuntime {
    static final Handler MAIN = new Handler(Looper.getMainLooper());
    private static Context context;
    private static VolumeSosStore store;
    static volatile VolumeSosForegroundService foreground;
    static volatile VolumeSosAccessibilityService accessibility;
    private static WeakReference<VolumeSosPlugin> plugin = new WeakReference<>(null);
    private static String captureId = "";
    private static final ArrayList<Integer> captureKeys = new ArrayList<>();
    private static long lastCaptureAt;
    private static VolumeSequenceMatcher matcher;

    static synchronized VolumeSosStore init(Context value) {
        if (store == null) { context = value.getApplicationContext(); store = new VolumeSosStore(context); }
        return store;
    }
    static VolumeSosStore store() { return store; }
    static void bind(VolumeSosPlugin value) { plugin = new WeakReference<>(value); }
    static void event(String name, JSObject value) { MAIN.post(() -> { VolumeSosPlugin target = plugin.get(); if (target != null) target.emit(name, value); }); }
    static void changed() { event("stateChanged", status()); }
    static boolean accessibilityEnabled() {
        String enabled = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        ComponentName name = new ComponentName(context, VolumeSosAccessibilityService.class);
        if (enabled == null) return false;
        // Android puede guardar la clase completa o la forma abreviada ".Clase".
        for (String component : enabled.split(":")) if (name.equals(ComponentName.unflattenFromString(component))) return true;
        return false;
    }
    static synchronized JSObject status() {
        JSArray sequence = new JSArray(); for (int key : store.sequence()) sequence.put(key == VolumeSequenceMatcher.UP ? "UP" : "DOWN");
        VolumeSosForegroundService service = foreground;
        return new JSObject().put("enabled", service != null && service.ready && accessibility != null && store.validSession())
            .put("recovering", service != null && service.ready && accessibility == null)
            .put("location", service != null ? service.locationStatus() : new VolumeSosLocation(context).status())
            .put("accessibilityEnabled", accessibilityEnabled()).put("accessibilityConnected", accessibility != null)
            .put("authorized", store.validSession()).put("expiresAt", store.session().optLong("expiresAt"))
            .put("sequence", sequence).put("captureId", captureId).put("lastResult", store.result());
    }
    static synchronized String beginCapture() {
        disable(); captureId = UUID.randomUUID().toString(); captureKeys.clear(); lastCaptureAt = 0;
        if (accessibility != null) accessibility.refreshFiltering();
        return captureId;
    }
    static synchronized void endCapture(String id) { if (id == null || id.equals(captureId)) { captureId = ""; captureKeys.clear(); } }
    static synchronized boolean capture(KeyEvent event) {
        if (captureId.isEmpty() || !volumeKey(event.getKeyCode())) return false;
        if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
            long now = event.getEventTime(); boolean gap = lastCaptureAt != 0 && now - lastCaptureAt > VolumeSequenceMatcher.MAX_GAP_MS;
            lastCaptureAt = now;
            if (captureKeys.size() < 13) captureKeys.add(event.getKeyCode());
            JSArray keys = new JSArray(); for (int key : captureKeys) keys.put(key == VolumeSequenceMatcher.UP ? "UP" : "DOWN");
            event("volumeKey", new JSObject().put("captureId", captureId).put("keys", keys).put("gap", gap).put("overflow", captureKeys.size() > 12));
        }
        return true;
    }
    static boolean volumeKey(int key) { return key == VolumeSequenceMatcher.UP || key == VolumeSequenceMatcher.DOWN; }
    static synchronized void startMatching() { matcher = new VolumeSequenceMatcher(store.sequence()); }
    static synchronized void key(KeyEvent event) {
        VolumeSosForegroundService service = foreground;
        if (service == null || !service.ready || !captureId.isEmpty() || matcher == null) return;
        if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0 && volumeKey(event.getKeyCode())) {
            if (!store.validSession()) { service.expire(); return; }
            if (matcher.accept(event.getKeyCode(), event.getEventTime())) service.trigger();
        }
    }
    static synchronized void disable() {
        if (store != null) store.setRequested(false);
        matcher = null;
        VolumeSosForegroundService running = foreground;
        if (running != null) running.stopDetection();
        if (context != null) context.stopService(new Intent(context, VolumeSosForegroundService.class));
        if (accessibility != null) accessibility.refreshFiltering();
    }
    static synchronized boolean shouldFilter() { return foreground != null && foreground.ready && captureId.isEmpty(); }
}
