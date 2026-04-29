"use strict";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const COOKIE_OPTS = () => ({
  httpOnly: true,
  sameSite: env.isProd ? "none" : "lax",
  secure: env.isProd,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: env.COOKIE_DOMAIN || undefined,
});

async function hashPw(pw) { return bcrypt.hash(pw, 10); }
async function checkPw(pw, hash) { return bcrypt.compare(pw, hash); }

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try { return jwt.verify(token, env.JWT_SECRET); }
  catch { return null; }
}

function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, COOKIE_OPTS());
}

function clearAuthCookie(res) {
  res.clearCookie(env.COOKIE_NAME, { path: "/", domain: env.COOKIE_DOMAIN || undefined });
}

module.exports = { hashPw, checkPw, signToken, verifyToken, setAuthCookie, clearAuthCookie };
