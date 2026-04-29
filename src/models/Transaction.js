"use strict";
const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now, index: true },
    type: { type: String, required: true, index: true },
    amt: { type: Number, required: true, min: 0 },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", index: true },
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger", index: true },
    mode: { type: String, enum: ["cash", "bank", "online", "cheque"], default: "cash" },
    remarks: { type: String, trim: true },
    by: { type: String, enum: ["admin", "agent"], default: "admin" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    handoverFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    commission: { type: Number, default: 0 },
    receiptNo: { type: String, index: true },
  },
  { timestamps: true }
);
module.exports = mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
