package com.emergen.mobile;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import com.getcapacitor.JSObject;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.json.JSONArray;
import org.json.JSONObject;

/** Sin contraseñas: JWT y reintento cifrados con una clave no exportable de Android Keystore. */
final class VolumeSosStore {
    private static final String ALIAS = "emergen.volume-sos.v1";
    private final SharedPreferences prefs;
    private JSONObject auth;

    VolumeSosStore(Context context) {
        prefs = context.getSharedPreferences("emergen_volume_sos", Context.MODE_PRIVATE);
        auth = decrypt("auth");
    }

    private SecretKey key() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null);
        if (store.containsAlias(ALIAS)) return (SecretKey) store.getKey(ALIAS, null);
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
        return generator.generateKey();
    }

    private void encrypt(String name, JSONObject value) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key());
        byte[] encrypted = cipher.doFinal(value.toString().getBytes(StandardCharsets.UTF_8));
        String encoded = Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP) + ":" + Base64.encodeToString(encrypted, Base64.NO_WRAP);
        if (!prefs.edit().putString(name, encoded).commit()) throw new IllegalStateException("No se pudo guardar la sesión nativa.");
    }

    private JSONObject decrypt(String name) {
        try {
            String encoded = prefs.getString(name, "");
            if (encoded.isEmpty()) return new JSONObject();
            String[] parts = encoded.split(":");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)));
            return new JSONObject(new String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), StandardCharsets.UTF_8));
        } catch (Exception ignored) { return new JSONObject(); }
    }

    synchronized JSONObject session() {
        try { return new JSONObject(auth.toString()); } catch (Exception ignored) { return new JSONObject(); }
    }
    synchronized boolean validSession() { return auth.optInt("userId") > 0 && auth.optLong("expiresAt") > System.currentTimeMillis(); }
    synchronized boolean setSession(JSONObject session) throws Exception {
        boolean changedUser = session.optInt("userId") != auth.optInt("userId");
        encrypt("auth", session); auth = session;
        if (changedUser) { setRequested(false); clearPending(); result("", 0); }
        return changedUser;
    }
    synchronized void clearSession() { auth = new JSONObject(); prefs.edit().remove("auth").remove("pending").remove("armedUserId").apply(); }
    synchronized boolean requested() { return validSession() && prefs.getInt("armedUserId", 0) == auth.optInt("userId"); }
    synchronized void setRequested(boolean enabled) {
        prefs.edit().putInt("armedUserId", enabled && validSession() ? auth.optInt("userId") : 0).commit();
    }
    synchronized int[] sequence() {
        try {
            JSONArray array = new JSONArray(prefs.getString("sequence_" + auth.optInt("userId"), "[]"));
            int[] keys = new int[array.length()]; for (int i = 0; i < keys.length; i++) keys[i] = array.getInt(i);
            return keys;
        } catch (Exception ignored) { return new int[0]; }
    }
    synchronized void saveSequence(int[] keys) {
        if (!validSession() || !VolumeSequenceMatcher.valid(keys)) throw new IllegalArgumentException("La sesión o la secuencia no es válida.");
        JSONArray array = new JSONArray(); for (int key : keys) array.put(key);
        prefs.edit().putString("sequence_" + auth.optInt("userId"), array.toString()).apply();
    }
    synchronized JSONObject pending() { return decrypt("pending"); }
    synchronized void pending(JSONObject value) throws Exception { encrypt("pending", value); }
    synchronized void clearPending() { prefs.edit().remove("pending").apply(); }
    synchronized void result(String message, int alertId) {
        prefs.edit().putString("lastMessage", message).putInt("lastAlertId", alertId).apply();
    }
    synchronized JSObject result() {
        String message = prefs.getString("lastMessage", "");
        // También simplificar el resultado conservado de una versión anterior del APK.
        if (message.startsWith("SOS #")) message = message.contains("Sin ubicación") ? "Alerta activada sin ubicación." : "Alerta activada.";
        return new JSObject().put("message", message).put("alertId", prefs.getInt("lastAlertId", 0));
    }
}
