"use strict";
/* eslint-disable no-console */
require("dotenv").config();
const { connect, disconnect } = require("../config/db");
const User = require("../models/User");
const Group = require("../models/Group");
const AccountType = require("../models/AccountType");
const Ledger = require("../models/Ledger");
const Settings = require("../models/Settings");
const { hashPw } = require("../utils/auth");

async function run() {
  await connect();

  const adminEmail = "admin@finsphere.local";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: await hashPw("admin123"),
      role: "admin",
    });
    console.log(`✔ Admin created: ${adminEmail} / admin123`);
  } else {
    console.log("✔ Admin already exists");
  }

  const defaultGroups = [
    { name: "Cash", type: "Asset" },
    { name: "Bank", type: "Asset" },
    { name: "Loans Given", type: "Asset" },
    { name: "Customer Deposits", type: "Liability" },
    { name: "Capital", type: "Equity" },
    { name: "Operating Income", type: "Income" },
    { name: "Operating Expense", type: "Expense" },
  ];
  for (const g of defaultGroups) {
    await Group.updateOne({ name: g.name }, { $setOnInsert: g }, { upsert: true });
  }
  console.log(`✔ Groups ensured (${defaultGroups.length})`);

  const defaultTypes = [
    { name: "Savings", group: "Customer Deposits", hasInterest: true, interestRate: 4 },
    { name: "Recurring Deposit", group: "Customer Deposits", hasInterest: true, interestRate: 6, hasDuration: true, defaultDuration: 12 },
    { name: "Fixed Deposit", group: "Customer Deposits", hasInterest: true, interestRate: 7, hasDuration: true, defaultDuration: 12 },
    { name: "Personal Loan", group: "Loans Given", hasInterest: true, interestRate: 18, hasDuration: true, defaultDuration: 12, isLoan: true },
    { name: "Gold Loan", group: "Loans Given", hasInterest: true, interestRate: 14, hasDuration: true, defaultDuration: 12, isLoan: true },
  ];
  for (const t of defaultTypes) {
    await AccountType.updateOne({ name: t.name }, { $setOnInsert: t }, { upsert: true });
  }
  console.log(`✔ Account types ensured (${defaultTypes.length})`);

  const defaultLedgers = [
    { name: "Office Cash", group: "Cash", isCash: true },
    { name: "HDFC Bank", group: "Bank" },
  ];
  for (const l of defaultLedgers) {
    await Ledger.updateOne({ name: l.name }, { $setOnInsert: l }, { upsert: true });
  }
  console.log(`✔ Ledgers ensured (${defaultLedgers.length})`);

  if (!(await Settings.findOne())) {
    await Settings.create({});
    console.log("✔ Settings initialized");
  }

  await disconnect();
  console.log("Seed complete.");
}

run().catch(async (e) => {
  console.error(e);
  await disconnect();
  process.exit(1);
});
