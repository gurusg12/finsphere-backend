"use strict";
const env = require("./config/env");

const { connect, disconnect } = require("./config/db");
const app = require("./app");

let server;

async function start() {
  await connect();
  server = app.listen(env.PORT, () => {
    console.log(`[finsphere-backend] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[finsphere-backend] ${signal} received, shutting down...`);
  if (server) await new Promise((r) => server.close(r));
  await disconnect();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (e) => { console.error("[unhandledRejection]", e); });
process.on("uncaughtException", (e) => { console.error("[uncaughtException]", e); });

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[startup]", err);
  process.exit(1);
});
