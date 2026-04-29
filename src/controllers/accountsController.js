"use strict";
const Account = require("../models/Account");
const AccountType = require("../models/AccountType");
const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.customer) filter.customer = req.query.customer;
  if (req.user.role === "agent") filter._id = { $in: req.user.assigned };
  const accounts = await Account.find(filter)
    .populate("customer", "name mobile")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ accounts });
};

exports.get = async (req, res) => {
  const a = await Account.findById(req.params.id).populate("customer").lean();
  if (!a) throw ApiError.notFound("Account not found");
  if (req.user.role === "agent" && !req.user.assigned.includes(String(a._id)))
    throw ApiError.forbidden();
  res.json({ account: a });
};

exports.create = async (req, res) => {
  const body = req.body;
  const at = await AccountType.findOne({ name: body.type }).lean();
  if (!at) throw ApiError.badRequest("Account type not found");
  const opened = body.openedOn ? new Date(body.openedOn) : new Date();
  let maturityOn;
  const dur = Number(body.durationMonths || at.defaultDuration || 0);
  if (dur > 0) {
    maturityOn = new Date(opened);
    maturityOn.setMonth(maturityOn.getMonth() + dur);
  }
  const acc = await Account.create({
    customer: body.customer,
    accNo: body.accNo,
    name: at.name,
    group: at.group,
    type: at.name,
    balance: Number(body.balance || 0),
    principal: Number(body.principal || 0),
    interestRate: Number(body.interestRate || at.interestRate || 0),
    durationMonths: dur,
    openedOn: opened,
    maturityOn,
    isLoan: !!at.isLoan,
  });
  res.status(201).json({ account: acc });
};

exports.update = async (req, res) => {
  const a = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!a) throw ApiError.notFound("Account not found");
  res.json({ account: a });
};

exports.remove = async (req, res) => {
  const txCount = await Transaction.countDocuments({ account: req.params.id });
  if (txCount > 0) throw ApiError.badRequest("Cannot delete account with existing transactions");
  const a = await Account.findByIdAndDelete(req.params.id);
  if (!a) throw ApiError.notFound("Account not found");
  res.json({ ok: true });
};
