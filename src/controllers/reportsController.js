"use strict";
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Ledger = require("../models/Ledger");
const Group = require("../models/Group");
const ApiError = require("../utils/ApiError");
const { getTxMod } = require("../utils/txLogic");

function rangeQ({ from, to }) {
  const q = {};
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) { const d = new Date(to); d.setHours(23, 59, 59, 999); q.date.$lte = d; }
  return q;
}

exports.daybook = async (req, res) => {
  const q = rangeQ(req.query);
  if (req.user.role === "agent") q.user = req.user.id;
  const txs = await Transaction.find(q)
    .populate({ path: "account", populate: { path: "customer", select: "name" } })
    .populate("ledger", "name")
    .sort({ date: 1 })
    .lean();
  res.json({ transactions: txs });
};

exports.balanceBook = async (req, res) => {
  const accFilter = req.user.role === "agent" ? { _id: { $in: req.user.assigned } } : {};
  const accounts = await Account.find(accFilter).populate("customer", "name").lean();
  const ledgers = req.user.role === "admin" ? await Ledger.find().lean() : [];
  res.json({ accounts, ledgers });
};

exports.ledger = async (req, res) => {
  const accountId = req.query.account;
  const { from, to } = req.query;
  if (!accountId) throw ApiError.badRequest("account required");
  const acc = await Account.findById(accountId).populate("customer").lean();
  if (!acc) throw ApiError.notFound();
  if (req.user.role === "agent" && !req.user.assigned.includes(String(acc._id)))
    throw ApiError.forbidden();
  const grp = await Group.findOne({ name: acc.group }).lean();
  const q = { account: accountId, ...rangeQ({ from, to }) };
  const txs = await Transaction.find(q).sort({ date: 1 }).lean();
  let running = 0;
  if (from) {
    const before = await Transaction.find({
      account: accountId,
      date: { $lt: new Date(from) },
    }).lean();
    running = before.reduce((s, t) => s + t.amt * getTxMod(grp, t.type), 0);
  }
  const opening = running;
  const rows = txs.map((t) => {
    const impact = t.amt * getTxMod(grp, t.type);
    running += impact;
    return { ...t, impact, running };
  });
  res.json({ account: acc, opening, rows, closing: running });
};

exports.loans = async (req, res) => {
  const filter = { isLoan: true };
  if (req.user.role === "agent") filter._id = { $in: req.user.assigned };
  const loans = await Account.find(filter).populate("customer", "name mobile").lean();
  res.json({ loans });
};

exports.pl = async (req, res) => {
  const q = rangeQ(req.query);
  const txs = await Transaction.find(q).lean();
  const incomeRows = txs.filter((t) => ["income", "repay_int"].includes(t.type));
  const expenseRows = txs.filter((t) => t.type === "expense");
  const income = incomeRows.reduce((s, t) => s + t.amt, 0);
  const expense = expenseRows.reduce((s, t) => s + t.amt, 0);
  const commission = txs.reduce((s, t) => s + (t.commission || 0), 0);
  res.json({
    income, expense, commission,
    netProfit: +(income - expense - commission).toFixed(2),
    incomeRows, expenseRows,
  });
};

exports.balanceSheet = async (_req, res) => {
  const groups = await Group.find().lean();
  const groupMap = Object.fromEntries(groups.map((g) => [g.name, g.type]));
  const accounts = await Account.find().populate("customer", "name").lean();
  const ledgers = await Ledger.find().lean();

  const buckets = { Asset: [], Liability: [], Equity: [], Income: [], Expense: [] };
  for (const a of accounts) {
    const t = groupMap[a.group] || "Asset";
    buckets[t].push({ name: `${a.customer?.name || "?"} — ${a.name}`, balance: a.balance, group: a.group });
  }
  for (const l of ledgers) {
    const t = groupMap[l.group] || "Asset";
    buckets[t].push({ name: l.name, balance: l.balance, group: l.group });
  }

  const txs = await Transaction.find().lean();
  const income = txs.filter((t) => ["income", "repay_int"].includes(t.type)).reduce((s, t) => s + t.amt, 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amt, 0);
  const netProfit = +(income - expense).toFixed(2);

  const totalAssets = buckets.Asset.reduce((s, x) => s + x.balance, 0);
  const totalLiab = buckets.Liability.reduce((s, x) => s + x.balance, 0);
  const totalEquity = buckets.Equity.reduce((s, x) => s + x.balance, 0) + netProfit;

  res.json({ buckets, netProfit, totalAssets, totalLiab, totalEquity });
};
