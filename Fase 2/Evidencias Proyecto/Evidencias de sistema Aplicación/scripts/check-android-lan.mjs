// Compatibilidad con el comando anterior; ahora comprueba PostgreSQL y WhatsApp.
process.argv.push("--mode", "android-lan");
await import("./check-environment.mjs");
