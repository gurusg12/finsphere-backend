"use strict";
const mongoose = require("mongoose");
const AccountTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    group: { type: String, required: true, trim: true },
    hasInterest: { type: Boolean, default: false },
    interestRate: { type: Number, default: 0 },
    hasDuration: { type: Boolean, default: false },
    defaultDuration: { type: Number, default: 0 },
    isLoan: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.models.AccountType || mongoose.model("AccountType", AccountTypeSchema);
