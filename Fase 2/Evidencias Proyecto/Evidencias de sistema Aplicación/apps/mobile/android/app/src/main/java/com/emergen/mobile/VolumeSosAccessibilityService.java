package com.emergen.mobile;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityEvent;

/** Solo teclas: sin contenido de ventanas, gestos, capturas, texto ni registro de otras teclas. */
public final class VolumeSosAccessibilityService extends AccessibilityService {
    @Override public void onCreate() { super.onCreate(); VolumeSosRuntime.init(this); }
    @Override protected void onServiceConnected() {
        VolumeSosRuntime.init(this); VolumeSosRuntime.accessibility = this;
        refreshFiltering(); VolumeSosRuntime.changed();
    }
    void refreshFiltering() {
        AccessibilityServiceInfo info = getServiceInfo();
        if (info == null) return;
        info.flags = VolumeSosRuntime.shouldFilter() ? AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS : 0;
        setServiceInfo(info);
    }
    @Override protected boolean onKeyEvent(KeyEvent event) {
        if (VolumeSosRuntime.volumeKey(event.getKeyCode())) VolumeSosRuntime.key(event);
        // Se conserva completo el flujo DOWN/UP del sistema y el uso normal del volumen.
        return false;
    }
    @Override public void onAccessibilityEvent(AccessibilityEvent event) { }
    @Override public void onInterrupt() { }
    @Override public void onDestroy() {
        // El sistema puede reconectar el servicio tras recuperar el proceso; la desactivación explícita
        // se detecta en Ajustes. No borrar aquí la elección del usuario ni detener un FGS recuperable.
        VolumeSosRuntime.accessibility = null; VolumeSosRuntime.changed(); super.onDestroy();
    }
}
