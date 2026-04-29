"use strict";
const env = require("../config/env");
const User = require("../models/User");
const { verifyToken } = require("../utils/auth");
const ApiError = require("../utils/ApiError");

function readToken(req) {
  if (req.cookies && req.cookies[env.COOKIE_NAME]) return req.cookies[env.COOKIE_NAME];
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return null;
}

async function attachUser(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  const payload = verifyToken(token);
  if (!payload) return next();
  const u = await User.findById(payload.id).lean();
  if (!u || !u.active) return next();
  req.user = {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    assigned: (u.assigned || []).map(String),
  };
  next();
}

function requireUser(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  next();
}

function requireAdmin(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== "admin") return next(ApiError.forbidden());
  next();
}

module.exports = { attachUser, requireUser, requireAdmin };
