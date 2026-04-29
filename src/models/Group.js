"use strict";
const mongoose = require("mongoose");
const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["Asset", "Liability", "Equity", "Income", "Expense"],
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.models.Group || mongoose.model("Group", GroupSchema);
