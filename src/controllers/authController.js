"use strict";
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { hashPw, checkPw, signToken, setAuthCookie, clearAuthCookie } = require("../utils/auth");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("Email already registered");
  const count = await User.countDocuments();
  const role = "admin";
  const user = await User.create({ name, email, password: await hashPw(password), role });
  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.active) throw ApiError.unauthorized("Invalid credentials");
  if (!(await checkPw(password, user.password))) throw ApiError.unauthorized("Invalid credentials");
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
};

exports.logout = async (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
};

exports.session = async (req, res) => {
  res.json({ user: req.user || null });
};
