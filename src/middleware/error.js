"use strict";
const ApiError = require("../utils/ApiError");
const env = require("../config/env");

// 404
function notFound(_req, _res, next) { next(ApiError.notFound("Route not found")); }

// Centralized error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  // Mongoose validation
  if (err && err.name === "ValidationError") {
    return res.status(400).json({ error: err.message, details: err.errors });
  }
  if (err && err.name === "CastError") {
    return res.status(400).json({ error: "Invalid id" });
  }
  if (err && err.code === 11000) {
    return res.status(409).json({ error: "Duplicate entry", details: err.keyValue });
  }
  const status = err.status || 500;
  const payload = { error: err.expose ? err.message : (status >= 500 ? "Internal server error" : err.message) };
  if (err.details) payload.details = err.details;
  if (!env.isProd && status >= 500) payload.stack = err.stack;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[err]", err);
  }
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
