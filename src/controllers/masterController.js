"use strict";
const Group = require("../models/Group");
const AccountType = require("../models/AccountType");
const Ledger = require("../models/Ledger");
const Account = require("../models/Account");
const ApiError = require("../utils/ApiError");

// Groups
exports.listGroups = async (_req, res) => {
  const groups = await Group.find().sort({ type: 1, name: 1 }).lean();
  res.json({ groups });
};
exports.createGroup = async (req, res) => {
  const g = await Group.create(req.body);
  res.status(201).json({ group: g });
};
exports.deleteGroup = async (req, res) => {
  const g = await Group.findById(req.body.id);
  if (!g) throw ApiError.notFound();
  const usedByType = await AccountType.exists({ group: g.name });
  const usedByLedger = await Ledger.exists({ group: g.name });
  const usedByAccount = await Account.exists({ group: g.name });
  if (usedByType || usedByLedger || usedByAccount)
    throw ApiError.badRequest("Group is in use by accounts/types/ledgers");
  await g.deleteOne();
  res.json({ ok: true });
};

// AccountTypes
exports.listTypes = async (_req, res) => {
  const types = await AccountType.find().sort({ name: 1 }).lean();
  res.json({ types });
};
exports.createType = async (req, res) => {
  const grp = await Group.findOne({ name: req.body.group });
  if (!grp) throw ApiError.badRequest("Group not found");
  const t = await AccountType.create(req.body);
  res.status(201).json({ type: t });
};
exports.deleteType = async (req, res) => {
  const t = await AccountType.findById(req.body.id);
  if (!t) throw ApiError.notFound();
  const used = await Account.exists({ type: t.name });
  if (used) throw ApiError.badRequest("Type is in use by accounts");
  await t.deleteOne();
  res.json({ ok: true });
};

// Ledgers
exports.listLedgers = async (_req, res) => {
  const ledgers = await Ledger.find().sort({ name: 1 }).lean();
  res.json({ ledgers });
};
exports.createLedger = async (req, res) => {
  const grp = await Group.findOne({ name: req.body.group });
  if (!grp) throw ApiError.badRequest("Group not found");
  const l = await Ledger.create(req.body);
  res.status(201).json({ ledger: l });
};
exports.deleteLedger = async (req, res) => {
  const l = await Ledger.findByIdAndDelete(req.body.id);
  if (!l) throw ApiError.notFound();
  res.json({ ok: true });
};
