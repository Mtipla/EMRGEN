package com.emergen.mobile;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.view.KeyEvent;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VolumeSosPlugin.class);
        super.onCreate(savedInstanceState);
        // El origen local sigue siendo https://localhost. Las APIs HTTP solo se permiten en debug.
        getBridge().getWebView().getSettings().setMixedContentMode(
            BuildConfig.DEBUG ? WebSettings.MIXED_CONTENT_ALWAYS_ALLOW : WebSettings.MIXED_CONTENT_NEVER_ALLOW
        );
    }
    @Override public boolean dispatchKeyEvent(KeyEvent event) {
        if (VolumeSosRuntime.capture(event)) return true;
        return super.dispatchKeyEvent(event);
    }
    @Override public void onPause() {
        VolumeSosRuntime.endCapture(null);
        super.onPause();
    }
}
