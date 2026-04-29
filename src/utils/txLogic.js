"use strict";
// Double-entry helpers — mirror the original FinSphere logic.

// Returns balance multiplier (-1 / +1) for primary (customer) account.
function getTxMod(group, type) {
  if (!group) return 1;
  const isAsset = group.type === "Asset";
  const isLiability = group.type === "Liability";
  const t = String(type).toLowerCase();
  if (isAsset) {
    if (["disburse", "withdraw", "expense"].includes(t)) return 1;
    if (["deposit", "repay_princ", "income"].includes(t)) return -1;
  }
  if (isLiability) {
    if (["deposit", "repay_princ"].includes(t)) return 1;
    if (["withdraw", "disburse"].includes(t)) return -1;
  }
  return 1;
}

// Cash/Bank ledger delta.
function secondaryDelta(type, amt) {
  const t = String(type).toLowerCase();
  if (["deposit", "repay_princ", "repay_int", "income", "agent_handover"].includes(t)) return +amt;
  if (["withdraw", "disburse", "expense"].includes(t)) return -amt;
  return 0;
}

const TX_TYPES = [
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
  { value: "disburse", label: "Loan Disburse" },
  { value: "repay_princ", label: "Loan Repayment (Principal)" },
  { value: "repay_int", label: "Loan Interest" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "agent_handover", label: "Agent Handover" },
];

const ALLOWED_TX_TYPES = new Set(TX_TYPES.map((t) => t.value));

module.exports = { getTxMod, secondaryDelta, TX_TYPES, ALLOWED_TX_TYPES };
