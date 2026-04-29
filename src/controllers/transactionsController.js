"use strict";
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Ledger = require("../models/Ledger");
const Group = require("../models/Group");
const ApiError = require("../utils/ApiError");
const { getTxMod, secondaryDelta } = require("../utils/txLogic");

exports.list = async (req, res) => {
  const { account, from, to, type } = req.query;
  const q = {};
  if (account) q.account = account;
  if (type) q.type = type;
  if (from || to) q.date = {};
  if (from) q.date.$gte = new Date(from);
  if (to) { const d = new Date(to); d.setHours(23, 59, 59, 999); q.date.$lte = d; }
  if (req.user.role === "agent") {
    q.$or = [{ account: { $in: req.user.assigned } }, { user: req.user.id }];
  }
  const txs = await Transaction.find(q)
    .populate({ path: "account", populate: { path: "customer", select: "name mobile" } })
    .populate("ledger")
    .populate("user", "name role")
    .sort({ date: -1, createdAt: -1 })
    .limit(1000)
    .lean();
  res.json({ transactions: txs });
};

exports.create = async (req, res) => {
  const body = req.body;
  const isAgent = req.user.role === "agent";
  const amt = Number(body.amt);

  // Use transaction (replica set required); fallback to non-tx if not supported.
  const session = await mongoose.startSession();
  let useTx = true;
  try { session.startTransaction(); } catch { useTx = false; }

  try {
    let primaryAcc = null;
    if (body.account) {
      primaryAcc = await Account.findById(body.account).session(useTx ? session : null);
      if (!primaryAcc) throw ApiError.notFound("Account not found");
      if (isAgent && !req.user.assigned.includes(String(primaryAcc._id)))
        throw ApiError.forbidden("Account not assigned to you");
    }
    if (primaryAcc) {
      const grp = await Group.findOne({ name: primaryAcc.group }).lean();
      const mod = getTxMod(grp, body.type);
      primaryAcc.balance += amt * mod;
      await primaryAcc.save({ session: useTx ? session : undefined });
    }

    let ledger = null;
    if (body.ledger) {
      ledger = await Ledger.findById(body.ledger).session(useTx ? session : null);
      if (ledger) {
        if (!(isAgent && body.type !== "agent_handover")) {
          ledger.balance += secondaryDelta(body.type, amt);
          await ledger.save({ session: useTx ? session : undefined });
        }
      }
    }

    const receiptNo = `R${Date.now().toString().slice(-8)}`;
    const created = await Transaction.create(
      [{
        date: body.date ? new Date(body.date) : new Date(),
        type: body.type,
        amt,
        account: primaryAcc ? primaryAcc._id : undefined,
        ledger: ledger ? ledger._id : undefined,
        mode: body.mode || "cash",
        remarks: body.remarks || "",
        by: isAgent ? "agent" : "admin",
        user: req.user.id,
        receiptNo,
      }],
      useTx ? { session } : {}
    );

    if (useTx) await session.commitTransaction();

    const populated = await Transaction.findById(created[0]._id)
      .populate({ path: "account", populate: { path: "customer" } })
      .populate("ledger")
      .populate("user", "name")
      .lean();
    res.status(201).json({ transaction: populated });
  } catch (err) {
    if (useTx) { try { await session.abortTransaction(); } catch {} }
    throw err;
  } finally {
    session.endSession();
  }
};

exports.remove = async (req, res) => {
  const t = await Transaction.findById(req.params.id);
  if (!t) throw ApiError.notFound();
  if (t.account) {
    const acc = await Account.findById(t.account);
    if (acc) {
      const grp = await Group.findOne({ name: acc.group }).lean();
      acc.balance -= t.amt * getTxMod(grp, t.type);
      await acc.save();
    }
  }
  if (t.ledger) {
    const led = await Ledger.findById(t.ledger);
    if (led && !(t.by === "agent" && t.type !== "agent_handover")) {
      led.balance -= secondaryDelta(t.type, t.amt);
      await led.save();
    }
  }
  await t.deleteOne();
  res.json({ ok: true });
};
