"use strict";
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Handover = require("../models/Handover");
const Ledger = require("../models/Ledger");
const ApiError = require("../utils/ApiError");
const { hashPw } = require("../utils/auth");

exports.listAgents = async (_req, res) => {
  const agents = await User.find({ role: "agent" }).lean();
  const ids = agents.map((a) => a._id);
  const txs = await Transaction.find({ user: { $in: ids } }).lean();
  const enriched = agents.map((a) => {
    const my = txs.filter((t) => String(t.user) === String(a._id));
    const collected = my
      .filter((t) => ["deposit", "repay_princ", "repay_int"].includes(t.type) && t.by === "agent")
      .reduce((s, t) => s + t.amt, 0);
    const handed = my.filter((t) => t.type === "agent_handover").reduce((s, t) => s + t.amt, 0);
    delete a.password;
    return { ...a, holding: collected - handed };
  });
  res.json({ agents: enriched });
};

exports.createAgent = async (req, res) => {
  const { name, email, password, mobile, commissionPct, assigned } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("Email taken");
  const u = await User.create({
    name, email, password: await hashPw(password),
    mobile, role: "agent", commissionPct, assigned,
  });
  res.status(201).json({ agent: { id: u._id, name: u.name, email: u.email } });
};

exports.updateAgent = async (req, res) => {
  const u = await User.findOneAndUpdate(
    { _id: req.params.id, role: "agent" },
    req.body,
    { new: true, runValidators: true }
  );
  if (!u) throw ApiError.notFound("Agent not found");
  res.json({ agent: u });
};

exports.deleteAgent = async (req, res) => {
  const u = await User.findOneAndDelete({ _id: req.params.id, role: "agent" });
  if (!u) throw ApiError.notFound();
  res.json({ ok: true });
};

// Handovers
exports.listHandovers = async (_req, res) => {
  const handovers = await Handover.find()
    .populate("agent", "name")
    .populate("ledger", "name")
    .sort({ date: -1 })
    .lean();
  res.json({ handovers });
};

exports.createHandover = async (req, res) => {
  const { agentId, amount, ledgerId, notes } = req.body;
  const agent = await User.findById(agentId);
  if (!agent || agent.role !== "agent") throw ApiError.notFound("Agent not found");
  const amt = Number(amount);
  const commission = +((amt * (agent.commissionPct || 0)) / 100).toFixed(2);
  const net = +(amt - commission).toFixed(2);
  const ledger = ledgerId ? await Ledger.findById(ledgerId) : null;
  if (ledger) { ledger.balance += net; await ledger.save(); }

  const tx = await Transaction.create({
    type: "agent_handover", amt: net, ledger: ledger ? ledger._id : undefined,
    by: "agent", user: agent._id, handoverFrom: agent._id, commission,
    remarks: notes || `Handover from ${agent.name}`,
    receiptNo: `H${Date.now().toString().slice(-8)}`,
  });
  const h = await Handover.create({
    agent: agent._id, amount: amt, commission, netReceived: net,
    ledger: ledger ? ledger._id : undefined, transaction: tx._id, notes,
  });
  res.status(201).json({ handover: h });
};
