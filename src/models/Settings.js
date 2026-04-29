"use strict";
const mongoose = require("mongoose");
const SettingsSchema = new mongoose.Schema(
  {
    orgName: { type: String, default: "FinSphere" },
    orgAddress: { type: String, default: "" },
    orgPhone: { type: String, default: "" },
    currency: { type: String, default: "₹" },
    receiptFooter: { type: String, default: "Thank you for banking with us" },
  },
  { timestamps: true }
);
module.exports = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
