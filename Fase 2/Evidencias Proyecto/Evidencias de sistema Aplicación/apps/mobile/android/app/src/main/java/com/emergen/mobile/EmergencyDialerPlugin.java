package com.emergen.mobile;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Abre el marcador; el usuario decide cuándo iniciar la llamada. */
@CapacitorPlugin(name = "EmergencyDialer")
public final class EmergencyDialerPlugin extends Plugin {
    @PluginMethod
    public void openDialer(PluginCall call) {
        String numero = call.getString("numero", "");
        if (!numero.matches("[0-9]{1,15}")) {
            call.reject("El número de teléfono no es válido.");
            return;
        }
        getActivity().runOnUiThread(() -> {
            try {
                Intent intent = new Intent(Intent.ACTION_DIAL, Uri.fromParts("tel", numero, null));
                getActivity().startActivity(intent);
                call.resolve();
            } catch (ActivityNotFoundException error) {
                call.reject("No hay una aplicación de teléfono disponible.");
            } catch (SecurityException error) {
                call.reject("El dispositivo no permitió abrir el marcador.");
            }
        });
    }
}
