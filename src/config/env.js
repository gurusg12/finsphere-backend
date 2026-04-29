"use strict";
require("dotenv").config();

const required = ["MONGODB_URI", "JWT_SECRET"];
for (const k of required) {
  if (!process.env[k]) {
    // eslint-disable-next-line no-console
    console.error(`[env] Missing required env var: ${k}`);
    process.exit(1);
  }
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000", 10),
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  COOKIE_NAME: process.env.COOKIE_NAME || "fs_token",
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

env.isProd = env.NODE_ENV === "production";
module.exports = env;
