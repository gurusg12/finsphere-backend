"use strict";
const mongoose = require("mongoose");
const AccountSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    accNo: { type: String, required: true, trim: true, index: true },
    name: { type: String, required: true },
    group: { type: String, required: true },
    type: { type: String, required: true },
    balance: { type: Number, default: 0 },
    principal: { type: Number, default: 0 },
    interestRate: { type: Number, default: 0 },
    durationMonths: { type: Number, default: 0 },
    openedOn: { type: Date, default: Date.now },
    maturityOn: Date,
    isLoan: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);
module.exports = mongoose.models.Account || mongoose.model("Account", AccountSchema);
