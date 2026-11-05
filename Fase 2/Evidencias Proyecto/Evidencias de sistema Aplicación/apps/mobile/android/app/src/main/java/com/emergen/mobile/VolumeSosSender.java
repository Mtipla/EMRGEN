package com.emergen.mobile;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.json.JSONArray;
import org.json.JSONObject;

/** Usa las mismas APIs y JWT que el SOS manual, incluso sin una WebView ejecutándose. */
final class VolumeSosSender {
    static final class Reply {
        final int status; final String body;
        Reply(int status, String body) { this.status = status; this.body = body; }
        JSONObject json() throws Exception { return new JSONObject(body); }
        String message() {
            try { JSONObject json = json(); return json.optString("detail", json.optString("message", "Error " + status)); }
            catch (Exception ignored) { return "Error " + status; }
        }
    }
    static Reply request(String base, String path, String token, JSONObject body) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(base + path).openConnection();
        try {
            connection.setConnectTimeout(4000); connection.setReadTimeout(6000);
            connection.setInstanceFollowRedirects(false); connection.setUseCaches(false);
            connection.setRequestProperty("Authorization", "Bearer " + token);
            connection.setRequestProperty("Accept", "application/json");
            if (body != null) {
                connection.setRequestMethod("POST"); connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");
                byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
                connection.setFixedLengthStreamingMode(bytes.length);
                try (OutputStream stream = connection.getOutputStream()) { stream.write(bytes); }
            }
            int status = connection.getResponseCode();
            InputStream input = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
            String text = "";
            if (input != null) {
                try (InputStream stream = input; java.io.ByteArrayOutputStream data = new java.io.ByteArrayOutputStream()) {
                    byte[] buffer = new byte[4096]; int count;
                    while ((count = stream.read(buffer)) != -1) {
                        if (data.size() + count > 262144) throw new IllegalStateException("Respuesta demasiado grande");
                        data.write(buffer, 0, count);
                    }
                    text = new String(data.toByteArray(), StandardCharsets.UTF_8);
                }
            }
            return new Reply(status, text);
        } finally { connection.disconnect(); }
    }

    static void send(VolumeSosForegroundService service) {
        VolumeSosStore store = VolumeSosRuntime.store();
        JSONObject session = store.session(); int owner = session.optInt("userId");
        try {
            if (!store.validSession()) { service.expire(); return; }
            String token = session.getString("token");
            JSONObject attempt = store.pending();
            if (attempt.optInt("userId") != owner || !attempt.has("body")) {
                Reply profile = request(session.getString("apiUrl"), "/usuarios/me/perfil", token, null);
                if (profile.status == 401) { service.expire(); return; }
                if (profile.status != 200) throw new IllegalStateException("No se pudo consultar la prioridad guardada.");
                int priority = profile.json().optInt("prioridad_ID", 0);
                if (priority <= 0) throw new IllegalStateException("Configura la finalidad de tu perfil antes de usar la secuencia.");
                JSONObject body = new JSONObject().put("clave_idempotencia", UUID.randomUUID().toString()).put("prioridad_id", priority);
                // Consultar lo más tarde posible permite incluir una posición recibida durante el GET del perfil.
                String location = service.recentLocation();
                if (location != null) body.put("ubicacion", location);
                attempt = new JSONObject().put("userId", owner).put("body", body);
                if (!service.ready || store.session().optInt("userId") != owner) return;
                store.pending(attempt);
            }
            if (!service.ready || !store.validSession() || store.session().optInt("userId") != owner) return;
            Reply reply = request(session.getString("internalApiUrl"), "/internal/v1/alertas", token, attempt.getJSONObject("body"));
            if (store.session().optInt("userId") != owner) return;
            if (reply.status == 401) { service.expire(); return; }
            if (reply.status >= 200 && reply.status < 300) {
                store.clearPending();
                int id = reply.json().getInt("alerta_id");
                String message = attempt.getJSONObject("body").has("ubicacion") ? "Alerta activada." : "Alerta activada sin ubicación.";
                service.result(message, id);
            } else if (reply.status == 409 && reply.message().contains("Ya existe una alerta activa")) {
                store.clearPending();
                Reply current = request(session.getString("internalApiUrl"), "/internal/v1/alertas?estado=ACTIVA&limit=1", token, null);
                int id = current.status == 200 && new JSONArray(current.body).length() > 0
                    ? new JSONArray(current.body).getJSONObject(0).optInt("alerta_id") : 0;
                service.result("Ya tienes una alerta activa. Revísala en EMERGEN.", id);
            } else {
                if (reply.status >= 400 && reply.status < 500) store.clearPending();
                service.result("No se confirmó el SOS: " + reply.message(), 0);
            }
        } catch (Exception error) {
            if (store.session().optInt("userId") != owner) return;
            String message = error instanceof IllegalStateException ? error.getMessage()
                : "No se pudo confirmar el SOS. Comprueba la red y repite la secuencia para reintentar.";
            service.result(message, 0);
        }
    }
}
