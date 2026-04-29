"use strict";
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "agent"], default: "agent" },
    mobile: { type: String, trim: true },
    assigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    commissionPct: { type: Number, default: 0, min: 0, max: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
