package com.emergen.mobile;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import com.getcapacitor.JSObject;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public final class VolumeSosForegroundService extends Service {
    static final String STOP = "com.emergen.mobile.VOLUME_SOS_STOP";
    private static final String CHANNEL = "emergen_volume_sos";
    private static final int ACTIVE_ID = 41001, RESULT_ID = 41002;
    volatile boolean ready;
    private VolumeSosLocation locations;
    private long accessibilityMissingSince;
    private final AtomicBoolean sending = new AtomicBoolean(false);
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Runnable expiry = new Runnable() {
        @Override public void run() {
            if (!ready) return;
            if (!VolumeSosRuntime.store().validSession()) { expire(); return; }
            if (!VolumeSosRuntime.accessibilityEnabled() || !locations.permitted()) {
                result("La detección se desactivó: revisa Accesibilidad y el permiso de ubicación.", 0);
                VolumeSosRuntime.disable(); VolumeSosRuntime.changed(); return;
            }
            if (VolumeSosRuntime.accessibility == null) {
                if (accessibilityMissingSince == 0) accessibilityMissingSince = android.os.SystemClock.elapsedRealtime();
                if (android.os.SystemClock.elapsedRealtime() - accessibilityMissingSince > 30000) {
                    result("No se reconectó Accesibilidad. Abre EMERGEN y reactiva el servicio.", 0);
                    VolumeSosRuntime.disable(); VolumeSosRuntime.changed(); return;
                }
            } else accessibilityMissingSince = 0;
            VolumeSosRuntime.changed();
            VolumeSosRuntime.MAIN.postDelayed(this, Math.min(5000, Math.max(1, VolumeSosRuntime.store().session().optLong("expiresAt") - System.currentTimeMillis())));
        }
    };

    @Override public void onCreate() {
        super.onCreate(); VolumeSosRuntime.init(this); locations = new VolumeSosLocation(this);
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL, "SOS mediante volumen", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Estado de la detección y resultado del registro SOS");
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }
    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if ((intent != null && STOP.equals(intent.getAction())) || (intent == null && !VolumeSosRuntime.store().requested())) {
            VolumeSosRuntime.store().setRequested(false); stopDetection(); stopSelf(); return START_NOT_STICKY;
        }
        try {
            if (!VolumeSosRuntime.store().validSession() || !VolumeSosRuntime.accessibilityEnabled() || !locations.permitted()
                || !VolumeSequenceMatcher.valid(VolumeSosRuntime.store().sequence())) {
                throw new IllegalStateException("Revisa sesión, Accesibilidad y permiso de ubicación antes de activar.");
            }
            Notification notification = notification("Detección activa. Usa tu secuencia de volumen.", true);
            if (Build.VERSION.SDK_INT >= 29) startForeground(ACTIVE_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
            else startForeground(ACTIVE_ID, notification);
            VolumeSosRuntime.store().setRequested(true);
            VolumeSosRuntime.foreground = this; ready = true;
            VolumeSosRuntime.startMatching();
            if (VolumeSosRuntime.accessibility != null) VolumeSosRuntime.accessibility.refreshFiltering();
            locations.start(); VolumeSosRuntime.MAIN.removeCallbacks(expiry); VolumeSosRuntime.MAIN.post(expiry);
            VolumeSosRuntime.changed();
        } catch (Exception error) {
            VolumeSosRuntime.store().result("No se pudo activar: " + error.getMessage(), 0);
            VolumeSosRuntime.store().setRequested(false); stopDetection(); stopSelf(); VolumeSosRuntime.changed();
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }
    JSObject locationStatus() { return locations.status(); }
    String recentLocation() { return locations.recent(); }
    void trigger() {
        if (!ready || !sending.compareAndSet(false, true)) return;
        result("Registrando SOS con tu prioridad guardada…", 0);
        executor.execute(() -> {
            PowerManager.WakeLock lock = ((PowerManager) getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "EMERGEN:VolumeSosRequest");
            try { lock.acquire(25000); VolumeSosSender.send(this); }
            finally { if (lock.isHeld()) lock.release(); sending.set(false); }
        });
    }
    void result(String message, int alertId) {
        VolumeSosRuntime.store().result(message, alertId);
        VolumeSosRuntime.MAIN.post(() -> {
            try { getSystemService(NotificationManager.class).notify(RESULT_ID, notification(message, false)); }
            catch (SecurityException ignored) { }
            VolumeSosRuntime.changed();
        });
    }
    void expire() {
        result("La sesión venció. Abre EMERGEN e inicia sesión para reactivar la detección.", 0);
        VolumeSosRuntime.MAIN.post(() -> { VolumeSosRuntime.disable(); VolumeSosRuntime.changed(); });
    }
    void stopDetection() {
        ready = false; VolumeSosRuntime.MAIN.removeCallbacks(expiry);
        if (locations != null) locations.stop();
        if (VolumeSosRuntime.foreground == this) VolumeSosRuntime.foreground = null;
        if (VolumeSosRuntime.accessibility != null) VolumeSosRuntime.accessibility.refreshFiltering();
        stopForeground(STOP_FOREGROUND_REMOVE);
    }
    private Notification notification(String message, boolean active) {
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(this, 41000, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder builder = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        builder.setSmallIcon(R.drawable.ic_sos_volume).setContentTitle("EMERGEN · SOS por volumen").setContentText(message)
            .setStyle(new Notification.BigTextStyle().bigText(message)).setContentIntent(content).setOngoing(active).setOnlyAlertOnce(true);
        if (active) {
            PendingIntent stop = PendingIntent.getService(this, 41003, new Intent(this, VolumeSosForegroundService.class).setAction(STOP), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            builder.addAction(new Notification.Action.Builder(null, "Desactivar", stop).build());
        } else builder.setAutoCancel(true);
        return builder.build();
    }
    @Override public IBinder onBind(Intent intent) { return null; }
    @Override public void onTaskRemoved(Intent rootIntent) {
        // Retirar la interfaz de Recientes no desactiva la elección del usuario ni su notificación.
        super.onTaskRemoved(rootIntent);
    }
    @Override public void onDestroy() {
        stopDetection(); executor.shutdownNow(); VolumeSosRuntime.changed(); super.onDestroy();
    }
}
