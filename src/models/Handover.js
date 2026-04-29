"use strict";
const mongoose = require("mongoose");
const HandoverSchema = new mongoose.Schema(
  {
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    netReceived: { type: Number, default: 0 },
    ledger: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    notes: String,
  },
  { timestamps: true }
);
module.exports = mongoose.models.Handover || mongoose.model("Handover", HandoverSchema);
