"use strict";
const Customer = require("../models/Customer");
const Account = require("../models/Account");
const ApiError = require("../utils/ApiError");

exports.list = async (req, res) => {
  let customers;
  if (req.user.role === "agent") {
    const accs = await Account.find({ _id: { $in: req.user.assigned } }).select("customer").lean();
    const ids = [...new Set(accs.map((a) => String(a.customer)))];
    customers = await Customer.find({ _id: { $in: ids } }).sort({ name: 1 }).lean();
  } else {
    customers = await Customer.find().sort({ name: 1 }).lean();
  }
  res.json({ customers });
};

exports.get = async (req, res) => {
  const c = await Customer.findById(req.params.id).lean();
  if (!c) throw ApiError.notFound("Customer not found");
  res.json({ customer: c });
};

exports.create = async (req, res) => {
  const c = await Customer.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ customer: c });
};

exports.update = async (req, res) => {
  const c = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!c) throw ApiError.notFound("Customer not found");
  res.json({ customer: c });
};

exports.remove = async (req, res) => {
  const has = await Account.exists({ customer: req.params.id });
  if (has) throw ApiError.badRequest("Cannot delete customer with existing accounts");
  const c = await Customer.findByIdAndDelete(req.params.id);
  if (!c) throw ApiError.notFound("Customer not found");
  res.json({ ok: true });
};
