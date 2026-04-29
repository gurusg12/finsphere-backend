"use strict";
const mongoose = require("mongoose");
const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    mobile: { type: String, trim: true },
    address: { type: String, trim: true },
    idProof: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
