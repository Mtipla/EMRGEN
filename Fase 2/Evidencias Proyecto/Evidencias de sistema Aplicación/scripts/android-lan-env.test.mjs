import { test } from "node:test";
import assert from "node:assert/strict";
import { androidLanUrls } from "./android-lan-env.mjs";

const valid = {
  VITE_API_URL: "http://192.168.0.4:3000",
  VITE_INTERNAL_API_URL: "http://192.168.0.4:8000",
};

test("acepta dos APIs LAN explícitas y el puerto alternativo de Docker", () => {
  assert.deepEqual(androidLanUrls(valid), valid);
  assert.equal(
    androidLanUrls({ ...valid, VITE_API_URL: "http://10.0.0.4:3001/" })
      .VITE_API_URL,
    "http://10.0.0.4:3001",
  );
});

test("impide empaquetar una API omitida, localhost o una URL con credenciales", () => {
  for (const value of [
    undefined,
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://REEMPLAZAR_IP_LAN:8000",
    "http://usuario:clave@192.168.0.4:8000",
  ]) {
    assert.throws(
      () => androidLanUrls({ ...valid, VITE_INTERNAL_API_URL: value }),
      /VITE_INTERNAL_API_URL/,
    );
  }
});

test("el modo LAN rechaza simulaciones incluso si se configura una variante debug nativa", () => {
  assert.throws(
    () => androidLanUrls({ ...valid, VITE_SOS_SIMULATED_LOCATION: "-33,-70" }),
    /ubicación real/,
  );
});
