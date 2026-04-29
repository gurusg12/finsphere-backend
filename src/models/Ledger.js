"use strict";
const mongoose = require("mongoose");
const LedgerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    group: { type: String, required: true, trim: true },
    balance: { type: Number, default: 0 },
    isCash: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
